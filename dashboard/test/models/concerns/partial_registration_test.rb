require 'test_helper'

class PartialRegistrationTest < ActiveSupport::TestCase
  # The PartialRegistration concern is only included in User, so we
  # are testing against User.

  test 'in_progress? is false when session has no user attributes' do
    refute PartialRegistration.in_progress? fake_empty_session
  end

  test 'in_progress? is true when session has user attributes' do
    assert PartialRegistration.in_progress? fake_session
  end

  test 'new_from_partial_registration raises unless a partial registration is available' do
    exception = assert_raise RuntimeError do
      User.new_from_partial_registration fake_empty_session
    end
    assert_equal 'No partial registration was in progress', exception.message
  end

  test 'new_from_partial_registration returns a User' do
    user = User.new_from_partial_registration fake_session
    assert_kind_of User, user
  end

  test 'new_from_partial_registration applies attributes to new User' do
    user = User.new_from_partial_registration fake_session(
      user_type: 'student',
      name: 'Fake Name',
      email: 'fake@example.com',
      password: 'fake password',
      age: 15,
    )
    assert user.student?
    assert_equal 'Fake Name', user.name
    assert_equal 'fake@example.com', user.email
    assert_equal 'fake password', user.password
    assert_equal 15, user.age
  end

  test 'new_from_partial_registration does not save the User' do
    user = User.new_from_partial_registration fake_session(
      user_type: 'student',
      name: 'Fake Name',
      email: 'fake@example.com',
      password: 'fake password',
      age: 15,
    )
    assert user.valid?
    refute user.persisted?
  end

  test 'new_from_partial_registration takes an optional block to modify the User' do
    user = User.new_from_partial_registration fake_session(
      user_type: 'student',
      name: 'Fake Name',
    ) do |u|
      u.name = 'Different fake name'
    end
    assert_equal 'Different fake name', user.name
  end

  test 'new_from_partial_registration loads oauth_token from cache' do
    email = 'oauth@example.com'
    CDO.shared_cache.write("oauth_token-#{email}", 'fake-oauth-token')
    user = User.new_from_partial_registration fake_session(
      user_type: 'student',
      name: 'Fake Name',
      email: email
    )
    assert_equal 'fake-oauth-token', user.oauth_token
  end

  test 'new_from_partial_registration loads oauth_refresh_token from cache' do
    email = 'oauth@example.com'
    CDO.shared_cache.write("oauth_refresh_token-#{email}", 'fake-refresh-token')
    user = User.new_from_partial_registration fake_session(
      user_type: 'student',
      name: 'Fake Name',
      email: email
    )
    assert_equal 'fake-refresh-token', user.oauth_refresh_token
  end

  private

  def fake_empty_session
    {}
  end

  def fake_session(user_attributes = {})
    {
      PartialRegistration::USER_ATTRIBUTES_SESSION_KEY => user_attributes
    }
  end
end
