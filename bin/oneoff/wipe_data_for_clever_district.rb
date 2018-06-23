require 'clever-ruby'
require_relative '../../dashboard/config/environment'

Clever.configure do |config|
  # District-specific oauth token (from district overview page)
  config.access_token = 'insert district token here'
end

api_instance = Clever::DataApi.new

begin
  data = api_instance.get_students({limit: 5000}).data
  found_students = 0
  data.each do |student|
    user = AuthenticationOption.find_by(
      credential_type: AuthenticationOption::CLEVER,
      authentication_id: student.data.id
    )&.user
    user ||= User.where(provider: 'clever', uid: student.data.id).first
    next if user.nil?
    puts "Clearing data for #{user.id} (with Clever ID #{user.uid})" unless user.nil?
    user.birthday = nil
    user.gender = nil
    user.save!
    found_students += 1
  end
  puts "Cleared data for #{found_students} students"
rescue Clever::ApiError => e
  puts "Exception: #{e}"
end
