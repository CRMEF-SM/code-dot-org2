class Api::V1::TeacherScoresController < Api::V1::JsonApiController
  before_action :authenticate_user!
  authorize_resource

  # POST /teacher_scores
  def score_stage_for_section
    TeacherScore.score_stage_for_section(
      current_user.id,
      params[:section_id],
      params[:stage_id],
      params[:score]
    )
    head :no_content
  end

  # POST /teacher_scores/get
  def get_teacher_scores_for_script
    @teacher_scores = TeacherScore.get_level_scores_for_script_for_section(
      params[:script_id],
      params[:section_id]
    )
    render json: @teacher_scores, each_serializer: Api::V1::TeacherScoreSerializer
  end

  private

  # Never trust parameters from the scary internet, only allow the following
  # list through.
  def teacher_score_params
    params.require(:teacher_score).permit(:user_level_id, :score, :teacher_id, :section_id, :stage_id, :script_id)
  end
end
