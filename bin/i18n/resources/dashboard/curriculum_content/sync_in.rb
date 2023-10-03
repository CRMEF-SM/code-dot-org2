#!/usr/bin/env ruby

require 'fileutils'
require 'json'

require_relative '../../../../../dashboard/config/environment'
require_relative '../../../../../dashboard/lib/services/i18n/curriculum_sync_utils/serializers'
require_relative '../../../i18n_script_utils'
require_relative '../../../redact_restore_utils'
require_relative '../../../utils/sync_in_base'
require_relative '../curriculum_content'

module I18n
  module Resources
    module Dashboard
      module CurriculumContent
        class SyncIn < I18n::Utils::SyncInBase
          def process
            # Serialize all curriculum data to the I18N source directory.
            #
            # Relies heavily on the custom serializer logic defined in
            # curriculum_sync_utils/serializers to generate a hash of results with
            # translator-readable keys, rather than the basic array that is produced by
            # default.
            Unit.find_each do |unit|
              next unless unit.is_migrated?
              next unless ::ScriptConstants.i18n?(unit.name)

              name = "#{unit.name}.json"
              i18n_source_file_path = File.join(I18N_SOURCE_DIR_PATH, get_unit_subdirectory(unit), name)
              next if I18nScriptUtils.unit_directory_change?(I18N_SOURCE_DIR_PATH, name, i18n_source_file_path)

              i18n_data = i18n_data_of(unit)
              next if i18n_data.blank?

              I18nScriptUtils.write_file(i18n_source_file_path, JSON.pretty_generate(i18n_data))
              redact_file_content(i18n_source_file_path)
            end
          end

          private

          def i18n_data_of(unit)
            # Select only lessons that pass `numbered_lesson?` for consistent `relative_position` values
            # throughout our translation pipeline
            i18n_data = Services::I18n::CurriculumSyncUtils::Serializers::ScriptCrowdinSerializer.new(
              unit, scope: {only_numbered_lessons: true}
            ).as_json.compact

            # The JSON object will have the unit's crowdin_key as the top level key, but we don't
            # need that, so we will discard the crowdin_key and set data to be the object it is
            # pointing to.
            i18n_data = i18n_data.first[1] unless i18n_data.first.nil?

            # we expect that some migrated units won't have any lesson plan content
            # at all; that's fine, we can just skip those.
            i18n_data.compact_blank! # don't want any empty values
          end

          def redact_file_content(i18n_source_file_path)
            i18n_original_file_path = i18n_source_file_path.sub(I18N_SOURCE_DIR, I18N_ORIGINAL_DIR)
            I18nScriptUtils.copy_file(i18n_source_file_path, i18n_original_file_path)

            redacted = RedactRestoreUtils.redact_file(i18n_source_file_path, REDACT_RESTORE_PLUGINS)
            I18nScriptUtils.write_file(i18n_source_file_path, JSON.pretty_generate(redacted))
          end

          # Helper method to get the desired destination subdirectory of the given
          # unit for the sync in. Note this may be a nested directory like "2021/csf"
          def get_unit_subdirectory(unit)
            # special-case Hour of Code units.
            return 'Hour of Code' if Unit.unit_in_category?('hoc', unit.name)

            # catchall for units without courses
            return 'other' if unit.get_course_version.blank?

            # special-case CSF and CSC; we want to group all CSF courses together and all CSC courses together,
            # even though they all have different course offerings.
            return File.join(unit.get_course_version.key, 'csf') if unit.csf?
            return File.join(unit.get_course_version.key, 'csc') if unit.csc?

            # base case
            File.join(unit.get_course_version.key, unit.get_course_version.course_offering.key)
          end
        end
      end
    end
  end
end

I18n::Resources::Dashboard::CurriculumContent::SyncIn.perform if __FILE__ == $0
