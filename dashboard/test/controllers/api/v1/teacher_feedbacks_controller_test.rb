require 'test_helper'

class Api::V1::TeacherFeedbacksControllerTest < ActionDispatch::IntegrationTest
  API = '/api/v1/teacher_feedbacks'
  COMMENT1 = 'Comment Alpha'
  COMMENT2 = 'Comment Beta'
  COMMENT3 = 'Comment Gamma'

  setup do
    #create student, teacher, and level and register student in teacher's section
    @teacher = create :teacher
    @student = create :student
    @section = create :section, user: @teacher
    @section.add_student(@student)
    @level = create :level
  end

  # Sign in as teacher and leave feedback for student on level.
  # Assert that the feedback request was successful
  def teacher_sign_in_and_comment(teacher, student, level, comment)
    sign_in teacher
    params = {
      student_id: student.id,
      level_id:  level.id,
      comment: comment
    }

    assert_creates(TeacherFeedback) do
      post API, params: {teacher_feedback: params}
      assert_response :success
    end
  end

  test 'can be created' do
    teacher_sign_in_and_comment(@teacher, @student, @level, COMMENT1)
    teacher_feedback = TeacherFeedback.last

    assert_equal @student.id, teacher_feedback.student_id
    assert_equal @level.id, teacher_feedback.level_id
    assert_equal @teacher.id, teacher_feedback.teacher_id
  end

  test 'can be retrieved by teacher' do
    teacher_sign_in_and_comment(@teacher, @student, @level, COMMENT1)
    get "#{API}/show_feedback_from_teacher?student_id=#{@student.id}&level_id=#{@level.id}&teacher_id=#{@teacher.id}"

    assert_equal COMMENT1, JSON.parse(@response.body)['comment']
  end

  test 'retrieves feedback for correct student' do
    student2 = create :student
    @section.add_student(student2)

    teacher_sign_in_and_comment(@teacher, @student, @level, COMMENT1)
    teacher_sign_in_and_comment(@teacher, student2, @level, COMMENT2)
    get "#{API}/show_feedback_from_teacher?student_id=#{@student.id}&level_id=#{@level.id}&teacher_id=#{@teacher.id}"

    assert_response :success
    assert_equal @student.id, JSON.parse(@response.body)['student_id']
    assert_equal COMMENT1, JSON.parse(@response.body)['comment']
  end

  test 'retrieves feedback from correct teacher' do
    teacher2 = create :teacher
    section2 = create :section, user: teacher2
    section2.add_student(@student)

    teacher_sign_in_and_comment(@teacher, @student, @level, COMMENT1)
    sign_out @teacher

    teacher_sign_in_and_comment(teacher2, @student, @level, COMMENT2)
    sign_out teacher2

    sign_in @teacher
    get "#{API}/show_feedback_from_teacher?student_id=#{@student.id}&level_id=#{@level.id}&teacher_id=#{@teacher.id}"
    assert_equal COMMENT1, JSON.parse(@response.body)['comment']

    get "#{API}/show_feedback_from_teacher?student_id=#{@student.id}&level_id=#{@level.id}&teacher_id=#{teacher2.id}"
    assert_equal COMMENT2, JSON.parse(@response.body)['comment']
  end

  test 'retrieves comment on requested level when teacher has given student feedback on multiple levels' do
    level2 = create :level
    level3 = create :level

    teacher_sign_in_and_comment(@teacher, @student, @level, COMMENT1)
    teacher_sign_in_and_comment(@teacher, @student, level2, COMMENT2)
    teacher_sign_in_and_comment(@teacher, @student, level3, COMMENT3)
    get "#{API}/show_feedback_from_teacher?student_id=#{@student.id}&level_id=#{level2.id}&teacher_id=#{@teacher.id}"

    assert_equal COMMENT2, JSON.parse(@response.body)['comment']
  end

  test 'retrieves the most recent comment from a teacher' do
    teacher_sign_in_and_comment(@teacher, @student, @level, COMMENT1)
    teacher_sign_in_and_comment(@teacher, @student, @level, COMMENT2)
    teacher_sign_in_and_comment(@teacher, @student, @level, COMMENT3)
    get "#{API}/show_feedback_from_teacher?student_id=#{@student.id}&level_id=#{@level.id}&teacher_id=#{@teacher.id}"

    assert_equal COMMENT3, JSON.parse(@response.body)['comment']
  end

  test 'student can retrieve feedback for a level - one comment, one teacher' do
    teacher_sign_in_and_comment(@teacher, @student, @level, COMMENT1)
    sign_in @student
    get "#{API}/show_feedback_for_level?student_id=#{@student.id}&level_id=#{@level.id}"

    assert_equal 1, JSON.parse(@response.body)['feedbacks'].count
    assert_equal COMMENT1, JSON.parse(@response.body)['feedbacks'][0]['comment']
  end

  test 'student can retrieve feedback for a level - two comments, one teacher' do
    teacher_sign_in_and_comment(@teacher, @student, @level, COMMENT1)
    #Mocks delay between teacher leaving comments
    sleep 1
    teacher_sign_in_and_comment(@teacher, @student, @level, COMMENT2)
    sign_out @teacher

    sign_in @student
    get "#{API}/show_feedback_for_level?student_id=#{@student.id}&level_id=#{@level.id}"

    assert_equal 1, JSON.parse(@response.body)['feedbacks'].count
    assert_equal COMMENT2, JSON.parse(@response.body)['feedbacks'][0]['comment']
  end

  test 'student can retrieve feedback for a level - two comments, two teachers' do
    teacher2 = create :teacher
    section2 = create :section, user: teacher2
    section2.add_student(@student)

    teacher_sign_in_and_comment(@teacher, @student, @level, COMMENT1)
    sign_out @teacher
    teacher_sign_in_and_comment(teacher2, @student, @level, COMMENT2)
    sign_out teacher2

    sign_in @student
    get "#{API}/show_feedback_for_level?student_id=#{@student.id}&level_id=#{@level.id}"

    assert_equal 2, JSON.parse(@response.body)['feedbacks'].count
    assert_equal COMMENT1, JSON.parse(@response.body)['feedbacks'][0]['comment']
    assert_equal COMMENT2, JSON.parse(@response.body)['feedbacks'][1]['comment']
  end

  test 'student can retrieve feedback for a level - three comments, two teachers' do
    teacher2 = create :teacher
    section2 = create :section, user: teacher2
    section2.add_student(@student)

    teacher_sign_in_and_comment(@teacher, @student, @level, COMMENT1)
    sign_out @teacher
    teacher_sign_in_and_comment(teacher2, @student, @level, COMMENT2)
    sign_out teacher2
    #Mocks delay between teacher leaving comments
    sleep 1
    teacher_sign_in_and_comment(@teacher, @student, @level, COMMENT3)
    sign_out @teacher

    sign_in @student
    get "#{API}/show_feedback_for_level?student_id=#{@student.id}&level_id=#{@level.id}"

    assert_equal 2, JSON.parse(@response.body)['feedbacks'].count
    assert_equal COMMENT2, JSON.parse(@response.body)['feedbacks'][0]['comment']
    assert_equal COMMENT3, JSON.parse(@response.body)['feedbacks'][1]['comment']
  end

  test 'student can retrieve feedback for a level - one comment, two teachers' do
    teacher2 = create :teacher
    section2 = create :section, user: teacher2
    section2.add_student(@student)

    teacher_sign_in_and_comment(@teacher, @student, @level, COMMENT1)
    sign_out @teacher

    sign_in @student
    get "#{API}/show_feedback_for_level?student_id=#{@student.id}&level_id=#{@level.id}"

    assert_equal 1, JSON.parse(@response.body)['feedbacks'].count
    assert_equal COMMENT1, JSON.parse(@response.body)['feedbacks'][0]['comment']
    assert_equal @teacher.id, JSON.parse(@response.body)['feedbacks'][0]['teacher_id']
  end

  test 'student can retrieve feedback for a level - two levels, one comment per level, one teacher' do
    level2 = create :level

    teacher_sign_in_and_comment(@teacher, @student, @level, COMMENT1)
    teacher_sign_in_and_comment(@teacher, @student, level2, COMMENT2)
    sign_out @teacher

    sign_in @student
    get "#{API}/show_feedback_for_level?student_id=#{@student.id}&level_id=#{@level.id}"

    assert_equal 1, JSON.parse(@response.body)['feedbacks'].count
    assert_equal COMMENT1, JSON.parse(@response.body)['feedbacks'][0]['comment']
  end

  test 'returns elegantly when no feedback' do
    sign_in @student
    get "#{API}/show_feedback_for_level?student_id=#{@student.id}&level_id=#{@level.id}"

    assert_equal 0, JSON.parse(@response.body)['feedbacks'].count
  end
end
