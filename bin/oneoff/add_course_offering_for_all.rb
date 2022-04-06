#!/usr/bin/env ruby

# For any Script or UnitGroup acting as a CourseVersion add a CourseOffering

require_relative '../../dashboard/config/environment'

def add_course_offering_for_all
  raise unless Rails.application.config.levelbuilder_mode

  Script.all.each do |script|
    next if script.unit_group

    next if script.family_name && script.version_year && script.is_course

    temp_script_name = script.name.downcase.tr('_ ', '-')
    script.family_name = temp_script_name unless script.family_name
    script.version_year = "unversioned" unless script.version_year
    script.is_course = true

    script.update!(skip_name_format_validation: true)

    CourseOffering.add_course_offering(script) unless script.course_version&.course_offering

    script.write_script_json
  end

  UnitGroup.all.each do |ug|
    next if ug.family_name && ug.version_year

    temp_ug_name = ug.name.downcase.tr('_ ', '-')
    ug.family_name =  temp_ug_name unless ug.family_name
    ug.version_year = "unversioned" unless ug.version_year

    ug.save!

    CourseOffering.add_course_offering(ug) unless ug.course_version&.course_offering

    ug.write_serialization
  end
end

add_course_offering_for_all
