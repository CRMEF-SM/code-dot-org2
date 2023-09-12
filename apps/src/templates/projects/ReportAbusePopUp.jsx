import PropTypes from 'prop-types';
import React from 'react';
import i18n from '@cdo/locale';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import AccessibleDialog from '@cdo/apps/templates/AccessibleDialog';
import RailsAuthenticityToken from '../../lib/util/RailsAuthenticityToken';
import style from './report-abuse-pop-up.module.scss';
import Button from '@cdo/apps/templates/Button';
import CheckBox from '@cdo/apps/componentLibrary/checkbox';
import {connect} from 'react-redux';

class UnconnectedReportAbusePopUp extends React.Component {
  static propTypes = {
    projectData: PropTypes.object,
    recaptchaSiteKey: PropTypes.string,
    onClose: PropTypes.func,
    abuseUrl: PropTypes.string,
    onReport: PropTypes.func,
  };

  constructor(props) {
    super(props);

    this.state = {
      showReportConfirmation: false,
      captchaCompleted: false,
      checkboxes: [
        {
          key: 'Cyberbullying',
          label: i18n.abuseTypeCyberbullying(),
          checked: false,
        },
        {
          key: 'Offensive-Content',
          label: i18n.abuseTypeOffensive(),
          checked: false,
        },
        {
          key: 'Copyright-Infringement',
          label: i18n.abuseTypeInfringement(),
          checked: false,
        },
        {key: 'Other', label: i18n.abuseTypeOther(), checked: false},
      ],
      showRecaptcha: false,
      submitButtonEnabled: false,
      loadedCaptcha: false,
    };
    this.cancel = this.cancel.bind(this);
    this.onCaptchaVerification = this.onCaptchaVerification.bind(this);
    this.token = ''; // captcha token
    this.onCaptchaExpiration = this.onCaptchaExpiration.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
  }

  componentDidUpdate() {
    const {showRecaptcha, loadedCaptcha} = this.state;

    if (showRecaptcha && !loadedCaptcha) {
      this.createCaptchaScript();
    }

    if (!showRecaptcha && loadedCaptcha) {
      this.cleanUpCaptcha();
    }
  }

  componentWillUnmount() {
    this.cleanUpCaptcha();
  }

  cleanUpCaptcha() {
    const captchaScript = document.getElementById('captcha');
    if (captchaScript) {
      const adjacentDiv = captchaScript.nextElementSibling;
      adjacentDiv.remove();
      captchaScript.remove();
    }
    this.setState({loadedCaptcha: false});
  }

  cancel() {
    this.props.onClose();
    this.setState({
      captchaCompleted: false, // reset captcha completion
      showRecaptcha: false, // reset checkboxes
      checkboxes: [
        {
          key: 'Cyberbullying',
          label: i18n.abuseTypeCyberbullying(),
          checked: false,
        },
        {
          key: 'Offensive-Content',
          label: i18n.abuseTypeOffensive(),
          checked: false,
        },
        {
          key: 'Copyright-Infringement',
          label: i18n.abuseTypeInfringement(),
          checked: false,
        },
        {key: 'Other', label: i18n.abuseTypeOther(), checked: false},
      ],
    });
    this.cleanUpCaptcha();
  }

  onCaptchaVerification(token) {
    this.setState({
      submitButtonEnabled: true,
      captchaCompleted: true,
    });
    this.token = token;
  }

  handleSubmit() {
    this.sendReportAbuse();
  }

  sendReportAbuse() {
    const formData = new FormData();

    // name, email, age set in controller through current_user
    formData.append(
      'authenticity_token',
      RailsAuthenticityToken.getRailsCSRFMetaTags().token
    );
    formData.append('channel_id', this.props.projectData.channel);
    formData.append('abuse_url', this.props.abuseUrl);
    formData.append('g-recaptcha-response', this.token);

    const checkedCheckboxNames = this.state.checkboxes
      .filter(checkbox => checkbox.checked)
      .map(checkbox => checkbox.key.replace(/-/g, ' '));
    formData.append('abuse_type', checkedCheckboxNames);

    fetch('/report_abuse_pop_up', {
      method: 'POST',
      body: formData,
    })
      .then(response => {
        if (response.ok) {
          this.setState({
            showReportConfirmation: true,
          });
          this.props.onReport();
        } else if (response.status === 403) {
          this.onCaptchaExpiration();
        }
      })
      .catch(error => {
        this.setState({
          submitButtonEnabled: false,
        });
        console.error('Error sending report data:', error);
      });
  }

  onCaptchaExpiration() {
    this.setState({
      submitButtonEnabled: false,
      captchaCompleted: false,
    });
  }

  handleCheckboxChange = checkboxKey => {
    this.setState(prevState => {
      const updatedCheckboxes = prevState.checkboxes.map(checkbox =>
        checkbox.key === checkboxKey
          ? {...checkbox, checked: !checkbox.checked}
          : checkbox
      );

      const showRecaptcha = updatedCheckboxes.some(
        checkbox => checkbox.checked
      );

      return {
        checkboxes: updatedCheckboxes,
        showRecaptcha,
      };
    });
  };

  createCaptchaScript() {
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js';
    script.id = 'captcha';
    script.async = true;
    script.defer = true;
    window.onCaptchaSubmit = token => this.onCaptchaVerification(token);
    window.onCaptchaExpired = () => this.onCaptchaExpiration();
    script.onload = () => this.setState({loadedCaptcha: true});
    document.body.appendChild(script);
  }

  render() {
    const {
      showRecaptcha,
      checkboxes,
      submitButtonEnabled,
      showReportConfirmation,
    } = this.state;

    const captchaSiteKey = this.props.recaptchaSiteKey;

    return (
      <AccessibleDialog className={style.popUp} onClose={this.cancel}>
        {showReportConfirmation ? (
          <div className={style.submitConfirmation}>
            <h3>{i18n.thankyou()}!</h3>
            <p>{i18n.thankYouForReport()}</p>
            <Button
              onClick={this.cancel}
              text={'Continue'}
              color={Button.ButtonColor.brandSecondaryDefault}
            />
          </div>
        ) : (
          <div>
            <div className={style.title}>
              <h3 style={{margin: 0}}>{i18n.reportAbuse()}</h3>
              <button
                type="reset"
                onClick={this.cancel}
                className={style.xButton}
              >
                <FontAwesome icon="x" className={style.xIcon} />
              </button>
            </div>
            <hr className={style.lines} />
            <p className={style.body}>{i18n.whyReport()}</p>
            <div>
              {checkboxes.map(checkbox => (
                <CheckBox
                  key={checkbox.key}
                  label={checkbox.label}
                  checked={checkbox.checked}
                  onChange={() => this.handleCheckboxChange(checkbox.key)}
                  size="s"
                />
              ))}
            </div>
            {showRecaptcha ? (
              <div
                style={{padding: 5}}
                className="g-recaptcha"
                data-sitekey={captchaSiteKey}
                data-callback="onCaptchaSubmit"
                data-expired-callback="onCaptchaExpired"
              />
            ) : null}
            <hr className={style.lines} />
            <div className={style.buttonHolder}>
              <Button
                onClick={this.cancel}
                text={i18n.cancel()}
                color={Button.ButtonColor.neutralDark}
              />
              <Button
                onClick={this.handleSubmit}
                disabled={!submitButtonEnabled}
                text={i18n.submit()}
                className={style.submitButton}
                color={Button.ButtonColor.brandSecondaryDefault}
              />
            </div>
          </div>
        )}
      </AccessibleDialog>
    );
  }
}

export default connect(state => ({
  recaptchaSiteKey: state.projects.captcha.captchaSiteKey,
}))(UnconnectedReportAbusePopUp);
