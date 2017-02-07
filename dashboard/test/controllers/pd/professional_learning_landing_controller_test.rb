require 'test_helper'

class Pd::ProfessionalLearningLandingControllerTest < ::ActionController::TestCase
  setup do
    @csf_workshop = create :pd_workshop, num_sessions: 3, course: Pd::Workshop::COURSE_CSF, subject: nil
    @csd_workshop = create :pd_workshop, num_sessions: 3, course: Pd::Workshop::COURSE_CSD, subject: nil
    @csp_workshop = create :pd_workshop, num_sessions: 3, course: Pd::Workshop::COURSE_CSP, subject: Pd::Workshop::SUBJECT_CSP_SUMMER_WORKSHOP

    @teacher = create(:admin, email: 'test_email@foo.com', user_type: 'teacher')

    [@csf_workshop, @csd_workshop, @csp_workshop].each do |workshop|
      create :pd_enrollment, email: @teacher.email, workshop: workshop
    end
  end

  test 'index returns expected values' do
    sign_in @teacher

    get :index
    assert_response :success
    response = assigns(:landing_page_data)

    assert_equal [Pd::Workshop::COURSE_CSF, Pd::Workshop::COURSE_CSD, Pd::Workshop::COURSE_CSP],
                 response[:courses_teaching]
  end
end
