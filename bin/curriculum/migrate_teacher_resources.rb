#!/usr/bin/env ruby
require_relative '../../dashboard/config/environment'

KEYS_TO_NAMES = {
  "curriculum" => 'Curriculum',
  "teacherForum" => 'Teacher Forum',
  "professionalLearning" => 'Professional Learning',
  "lessonPlans" => 'Lesson Plans',
  "vocabulary" => 'Vocabulary',
  "codeIntroduced" => 'Code Introduced',
  "standardMappings" => 'Standard Mappings',
  "allHandouts" => 'All Handouts',
  "videos" => 'Videos',
  "curriculumGuide" => 'Curriculum Guide'
}

def create_resource_from_teacher_resource(teacher_resource, course_version_id)
  name = KEYS_TO_NAMES[teacher_resource[0]] || teacher_resource[0]
  resource = Resource.find_or_initialize_by(
    name: name,
    url: teacher_resource[1],
    course_version_id: course_version_id
  )
  resource.audience = 'Teacher'
  resource.save! if resource.changed?
  resource
end

def migrate_resources_for_scripts
  Script.all.to_a.select(&:is_migrated).each do |script|
    next if script.teacher_resources.blank?
    course_version = script.get_course_version
    next unless course_version
    script.resources =
      script.teacher_resources.map {|tr| create_resource_from_teacher_resource(tr, course_version.id)}

    # For translated scripts, we must keep serving the legacy teacher resources
    # until migrated teacher resources have been translated.
    script.teacher_resources = [] unless ScriptConstants.i18n?(script.name)

    script.save!
    script.write_script_json
    puts "Migrated teacher resources for #{script.name}"
  end
end

def migrate_resources_for_unit_groups
  UnitGroup.all.to_a.select(&:has_migrated_unit?).each do |unit_group|
    next if unit_group.teacher_resources.blank?
    course_version = unit_group.course_version
    next unless course_version
    unit_group.resources =
      unit_group.teacher_resources.map {|tr| create_resource_from_teacher_resource(tr, course_version.id)}

    # do not remove legacy teacher resources yet. keep serving the legacy
    # teacher resources until migrated teacher resources have been translated.

    unit_group.save!
    puts "Migrated teacher resources for #{unit_group.name}"
  end
end

migrate_resources_for_scripts
migrate_resources_for_unit_groups
