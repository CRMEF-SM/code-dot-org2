require 'cdo/db'
require 'digest/md5'
require_relative 'email_validator'
require 'mail'
require 'openssl'
require 'base64'
require 'digest/md5'

module Poste
  def self.logger
    @@logger ||= $log
  end

  def self.emails_dir(*paths)
    pegasus_dir 'emails', *paths
  end

  def self.decrypt(encrypted)
    decrypter = OpenSSL::Cipher::Cipher.new 'AES-128-CBC'
    decrypter.decrypt
    decrypter.pkcs5_keyivgen(CDO.poste_secret, '8 octets')
    plain = decrypter.update Base64.urlsafe_decode64(encrypted)
    plain << decrypter.final
  end

  def self.decrypt_id(encrypted)
    return decrypt(encrypted).to_i
  end

  def self.encrypt(plain)
    encrypter = OpenSSL::Cipher::Cipher.new('AES-128-CBC')
    encrypter.encrypt
    encrypter.pkcs5_keyivgen(CDO.poste_secret, '8 octets')
    encrypted = encrypter.update(plain.to_s)
    encrypted << encrypter.final
    Base64.urlsafe_encode64(encrypted)
  end

  def self.encrypt_id(id)
    encrypt(id)
  end

  def self.resolve_template(name)
    template_extnames.each do |extname|
      path = emails_dir "#{name}#{extname}"
      next unless File.file? path

      messages = POSTE_DB[:poste_messages]
      unless messages.where(name: name).first
        id = messages.insert(name: name)
        raise StandardError, "Couldn't create poste_message row for '#{name}'" unless id > 0
        logger.info "Registered new message template '#{name}' as #{id}" if logger
      end

      return path
    end
    nil
  end

  def self.template_extnames
    ['.md','.haml','.html']
  end

  def self.unsubscribed?(email)
    hashed_email = Digest::MD5.hexdigest(email.to_s.strip.downcase)
    !!POSTE_DB[:contacts].where('hashed_email = ? AND unsubscribed_at IS NOT NULL', hashed_email).first
  end

  def self.unsubscribe(email, params={})
    email = email.to_s.strip.downcase
    hashed_email = Digest::MD5.hexdigest(email)
    now = DateTime.now

    contacts = POSTE_DB[:contacts]
    contact = contacts.where(hashed_email: hashed_email).first
    if contact
      contacts.where(id: contact[:id]).update(
        unsubscribed_at: now,
        unsubscribed_ip: params[:ip_address],
      )
    else
      contacts.insert(
        email: email,
        hashed_email: hashed_email,
        created_at: now,
        created_ip: params[:ip_address],
        unsubscribed_at: now,
        unsubscribed_ip: params[:ip_address],
        updated_at: now,
        updated_ip: params[:ip_address],
      )
    end
  end
end

module Poste2
  @@url_cache = {}
  @@message_id_cache = {}

  # Returns true if address is a valid email address.
  def self.email_address?(address)
    EmailValidator.email_address?(address)
  end

  def self.find_or_create_url(href)
    hash = Digest::MD5.hexdigest(href)

    url_id = @@url_cache[href]
    return url_id if url_id

    if url = POSTE_DB[:poste_urls].where(hash: hash, url: href).first
      url_id = url[:id]
    else
      url_id = POSTE_DB[:poste_urls].insert(hash: hash, url: href)
    end

    @@url_cache[href] = url_id
  end

  def self.create_recipient(email, params={})
    email = email.to_s.strip.downcase
    hashed_email = Digest::MD5.hexdigest(email)
    raise ArgumentError, "Invalid email address (#{email})" unless email_address?(email)

    name = params[:name].strip if params[:name]
    ip_address = params[:ip_address]
    now = DateTime.now

    contacts = POSTE_DB[:contacts]

    contact = contacts.where(hashed_email: hashed_email).first
    if contact
      if contact[:name] != name && !name.nil_or_empty?
        contacts.where(id: contact[:id]).update(
          name: name,
          updated_at: now,
          updated_ip: ip_address,
        )
      end
    else
      id = contacts.insert({}.tap do |contact|
        contact[:email] = email
        contact[:hashed_email] = hashed_email
        contact[:name] = name if name
        contact[:created_at] = now
        contact[:created_ip] = ip_address
        contact[:updated_at] = now
        contact[:updated_ip] = ip_address
      end)
      contact = {id: id}
    end

    {id: contact[:id], email: email, name: name, ip_address: ip_address}
  end

  def self.ensure_recipient(email, params={})
    email = email.to_s.strip.downcase
    hashed_email = Digest::MD5.hexdigest(email)
    raise ArgumentError, 'Invalid email address' unless email_address?(email)

    name = params[:name].strip if params[:name]
    ip_address = params[:ip_address]
    now = DateTime.now

    contacts = POSTE_DB[:contacts]

    contact = contacts.where(hashed_email: hashed_email).first
    unless contact
      id = contacts.insert({}.tap do |contact|
        contact[:email] = email
        contact[:hashed_email] = hashed_email
        contact[:name] = name if name
        contact[:created_at] = now
        contact[:created_ip] = ip_address
        contact[:updated_at] = now
        contact[:updated_ip] = ip_address
      end)
      contact = {id: id}
    end

    {id: contact[:id], email: email, name: name, ip_address: ip_address}
  end

  def self.attachment_dir
    # Get directory from settings (locals.yml / globals.yml)
    # If none specified, use ./poste_attachments
    path = CDO.poste_attachment_dir || File.join(Dir.pwd, 'poste_attachments')
    Dir.mkdir(path) unless Dir.exist?(path)
    path
  end

  # Takes a hash of name=>content, saves each to a file, and returns a
  # hash of name=>saved_filename
  def self.save_attachments(attachments)
    timestamp = DateTime.now.strftime('%Y%m%d_%H%M_%S%L')
    {}.tap do |saved|
      attachments.each do |name, content|
        filename = File.expand_path "#{attachment_dir}/#{timestamp}-#{name}"
        File.open(filename, 'w+b'){|f| f.write content}
        saved[name] = filename
      end
    end
  end

  # Takes a hash of name=>saved_filename, loads each file, and returns a
  # hash of name=>content
  def self.load_attachments(attachments)
    {}.tap do |results|
      attachments.each do |name, filename|
        content = File.binread(filename)
        results[name] = Base64.encode64(content)
      end
    end
  end

  def self.send_message(message_name, recipient, params = {})
    raise ArgumentError, 'No recipient' unless recipient && recipient[:id] && recipient[:email] && recipient[:ip_address]

    if params[:attachments]
      params[:attachments] = save_attachments(params[:attachments])
    end

    message_name = message_name.to_s.strip
    unless message_id = @@message_id_cache[message_name]
      message = POSTE_DB[:poste_messages].where(name: message_name).first
      message ||= POSTE_DB[:poste_messages].where(name: message_name).first if Poste.resolve_template(message_name)
      raise ArgumentError, "No #{message_name} message found." unless message
      message_id = @@message_id_cache[message_name] = message[:id]
    end

    POSTE_DB[:poste_deliveries].insert({
      created_at: DateTime.now,
      created_ip: recipient[:ip_address],
      contact_id: recipient[:id],
      contact_email: recipient[:email],
      hashed_email: Digest::MD5.hexdigest(recipient[:email]),
      message_id: message_id,
      params: (params).to_json,
    })
  end

  class DeliveryMethod
    ALLOWED_SENDERS = Set.new %w[
      pd@code.org
      noreply@code.org
      teacher@code.org
      hadi_partovi@code.org
    ]

    def initialize(settings = nil)
    end

    def deliver!(mail)
      attachments = nil

      # Support multipart/mixed emails consisting of attachment(s) and a main part
      if mail.multipart?
        attachment_parts, body_parts = mail.parts.partition(&:attachment?)
        raise 'Multipart messages are only supported with attachments and a single body' unless body_parts.length == 1
        body_part = body_parts.first

        attachments = {}
        attachment_parts.each do |attachment|
          attachments[attachment.filename] = attachment.body.decoded
        end
      else
        body_part = mail
      end

      content_type = body_part.content_type
      raise ArgumentError, "Unsupported message type: #{content_type}" unless content_type =~ /^text\/html;/ && content_type =~ /charset=UTF-8/
      body = body_part.body.to_s

      sender_email = mail.from.first
      raise ArgumentError, "Unsupported sender: #{sender_email}" unless ALLOWED_SENDERS.include?(sender_email)
      raise ArgumentError, 'Recipient (to field) is required.' unless mail[:to]

      sender = mail[:from].formatted.first
      to_address = mail[:to].addresses.first
      to_name = mail[:to].display_names.first
      mail_params = {
        body: body,
        subject: mail.subject.to_s,
        from: sender
      }
      mail_params[:reply_to] = mail[:reply_to].formatted.first if mail[:reply_to]
      mail_params[:attachments] = attachments if attachments
      recipient = Poste2.ensure_recipient(to_address, name: to_name, ip_address: '127.0.0.1')
      Poste2.send_message('dashboard', recipient, mail_params)
    end
  end
end
