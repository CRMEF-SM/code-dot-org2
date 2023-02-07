# Various Ruby helper methods, originally from the `cdo-varnish` cookbook

module HttpHelpers
  # Basic regex matcher for an optional query part of a URL followed by end-of-string anchor.
  END_URL_REGEX = "(\\?.*)?$".freeze

  # CloudFront removes these headers by default, but can be added back via whitelist.
  # Ref: http://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/RequestAndResponseBehaviorCustomOrigin.html#request-custom-headers-behavior
  # Simulate similar behavior in Varnish, with optional defaults.
  REMOVED_HEADERS = %w(
    Accept
    Accept-Charset
    Accept-Language:en-US
    Referer
    User-Agent:Cached-Request
  ).freeze

  # Takes an array of path-patterns as input, validating and normalizing
  # them for use within a Varnish (or Ruby) regular expression.
  # Returns an array of path-matching Varnish/Ruby regular expression strings.
  def self.normalize_paths(paths)
    paths = [paths] unless paths.is_a?(Array)
    paths.map(&:dup).map do |path|
      raise ArgumentError.new("Invalid path: #{path}") unless valid_path?(path)
      # Strip leading slash from extension path
      path.gsub!(/^\/(?=\*.)/, '')
      # Escape some valid special characters
      path.gsub!(/[.+$"]/) {|s| '\\' + s}
      # Replace * wildcards with .* regex fragment
      path.gsub!(/\*/, '.*')
      "^#{path}#{END_URL_REGEX}"
    end
  end

  # Ensures paths are valid, but don't return any processed results.
  # Used by the CloudFront layer to avoid duplicating path-validation logic.
  def self.validate_paths(paths)
    normalize_paths paths
    nil
  end

  # The maximum length of a path pattern is 255 characters.
  # The value can contain any of the following characters:
  # A-Z, a-z (case sensitive, so the path pattern /*.jpg doesn't apply to the file /LOGO.JPG.)
  # 0-9
  # _ - . $ / ~ " ' @ : +
  #
  # The following characters are allowed in CloudFront path patterns, but
  # are not allowed in our configuration format to reduce complexity:
  # * (exactly one wildcard required, either at the start or end of the path)
  # ? (No 1-character wildcards allowed)
  # &, passed and returned as &amp;
  def self.valid_path?(path)
    # Maximum length
    return false if path.length > 255
    # Valid characters allowed
    ch = /[A-Za-z0-9_\-.$\/~"'@:+]*/
    # Require leading slash, maximum one wildcard allowed at start or end
    !!path.match(/^\/( \*#{ch} | #{ch}\* | #{ch} )$/x)
  end

  # Evaluate the provided path against the provided config, returning the first matched behavior.
  def self.behavior_for_path(behaviors, path)
    behaviors.detect do |behavior|
      paths = behavior[:path]
      next true unless paths
      normalize_paths(paths).any? {|p| path.match p}
    end
  end
end
