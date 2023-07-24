# == Schema Information
#
# Table name: learning_goal_evidence_levels
#
#  id                  :bigint           not null, primary key
#  learning_goal_id    :integer          not null
#  understanding       :integer          not null
#  teacher_description :text(65535)
#  ai_prompt           :text(65535)
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#
# Indexes
#
#  index_learning_goal_evidence_levels_on_lg_id_and_understanding  (learning_goal_id,understanding) UNIQUE
#
class LearningGoalEvidenceLevel < ApplicationRecord
  belongs_to :learning_goal
end
