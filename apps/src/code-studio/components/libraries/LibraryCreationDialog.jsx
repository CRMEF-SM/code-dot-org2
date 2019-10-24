/*global dashboard*/
import React from 'react';
import PropTypes from 'prop-types';
import Dialog, {Body} from '@cdo/apps/templates/Dialog';
import {connect} from 'react-redux';
import {hideLibraryCreationDialog} from '../shareDialogRedux';
import libraryParser from './libraryParser';
import i18n from '@cdo/locale';
import PadAndCenter from '@cdo/apps/templates/teacherDashboard/PadAndCenter';
import {Heading1, Heading2} from '@cdo/apps/lib/ui/Headings';
import Spinner from '../../pd/components/spinner';

const styles = {
  alert: {
    color: 'red'
  },
  libraryBoundary: {
    padding: 10
  },
  largerCheckbox: {
    width: 20,
    height: 20,
    margin: 10
  },
  functionItem: {
    marginBottom: 20
  },
  textarea: {
    width: 400
  },
  centerSpinner: {
    display: 'flex',
    justifyContent: 'center'
  }
};

function select(event) {
  event.target.select();
}

/**
 * @readonly
 * @enum {string}
 */
const LoadingState = {
  LOADING: 'loading',
  DONE_LOADING: 'done_loading',
  PUBLISHED: 'published'
};

class LibraryCreationDialog extends React.Component {
  static propTypes = {
    dialogIsOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    clientApi: PropTypes.object.isRequired
  };

  state = {
    librarySource: '',
    sourceFunctionList: [],
    loadingState: LoadingState.LOADING,
    libraryName: '',
    canPublish: false
  };

  componentDidUpdate(prevProps) {
    if (prevProps.dialogIsOpen === false && this.props.dialogIsOpen === true) {
      this.onOpen();
    }
  }

  onOpen = () => {
    dashboard.project.getUpdatedSourceAndHtml_(response => {
      this.setState({
        libraryName: libraryParser.sanitizeName(
          dashboard.project.getCurrentName()
        ),
        librarySource: response.source,
        loadingState: LoadingState.DONE_LOADING,
        sourceFunctionList: libraryParser.getFunctions(response.source)
      });
    });
  };

  handleClose = () => {
    this.setState({loadingState: LoadingState.LOADING});
    this.props.onClose();
  };

  publish = event => {
    let formElements = this.formElements.elements;
    let selectedFunctionList = [];
    let libraryDescription = '';
    [...formElements].forEach(element => {
      if (element.type === 'checkbox' && element.checked) {
        selectedFunctionList.push(this.state.sourceFunctionList[element.value]);
      }
      if (element.type === 'textarea') {
        libraryDescription = element.value;
      }
    });
    let libraryJson = libraryParser.createLibraryJson(
      this.state.librarySource,
      selectedFunctionList,
      this.state.libraryName,
      libraryDescription
    );

    // TODO: Display final version of error and success messages to the user.
    this.props.clientApi.publish(
      libraryJson,
      error => {
        console.warn(`Error publishing library: ${error}`);
      },
      () => {
        this.setState({loadingState: LoadingState.PUBLISHED});
      }
    );
    dashboard.project.setLibraryName(this.state.libraryName);
    event.preventDefault();
  };

  validateInput = () => {
    // Check if any of the checkboxes are checked
    // If this changes the publishable state, update
    let formElements = this.formElements.elements;
    let isChecked = false;
    [...formElements].forEach(element => {
      if (element.type === 'checkbox' && element.checked) {
        isChecked = true;
      }
    });
    if (isChecked !== this.state.canPublish) {
      this.setState({canPublish: isChecked});
    }
  };

  displayFunctions = () => {
    if (this.state.loadingState === LoadingState.LOADING) {
      return (
        <div style={styles.centerSpinner}>
          <Spinner />
        </div>
      );
    } else if (this.state.loadingState === LoadingState.DONE_LOADING) {
      let keyIndex = 0;
      return (
        <div>
          <Heading2>
            <b>{i18n.libraryName()}</b>
            {this.state.libraryName}
          </Heading2>
          <form
            ref={formElements => {
              this.formElements = formElements;
            }}
            onSubmit={this.publish}
          >
            <textarea
              required
              name="description"
              rows="2"
              cols="200"
              style={styles.textarea}
              placeholder="Write a description of your library"
            />
            {this.state.sourceFunctionList.map(sourceFunction => {
              let name = sourceFunction.functionName;
              let comment = sourceFunction.comment;
              return (
                <div key={keyIndex} style={styles.functionItem}>
                  <input
                    type="checkbox"
                    style={styles.largerCheckbox}
                    disabled={comment.length === 0}
                    onClick={this.validateInput}
                    value={keyIndex++}
                  />
                  {name}
                  <br />
                  {comment.length === 0 && (
                    <p style={styles.alert}>
                      {i18n.libraryExportNoCommentError()}
                    </p>
                  )}
                  <pre>{comment}</pre>
                </div>
              );
            })}
            <input
              className="btn btn-primary"
              type="submit"
              value={i18n.publish()}
              disabled={!this.state.canPublish}
            />
          </form>
        </div>
      );
    } else {
      return (
        <div>
          <Heading2>
            <b>Successfully published your library: </b>
            {this.state.libraryName}
          </Heading2>
          <div>
            <p style={{fontSize: 20}}>
              Share this code with others so they can use your library in their
              project:
            </p>
            <input
              type="text"
              id="library-sharing"
              onClick={select}
              readOnly="true"
              value={dashboard.project.getCurrentId()}
              style={{cursor: 'copy', width: 500}}
            />
          </div>
        </div>
      );
    }
  };

  render() {
    return (
      <Dialog
        isOpen={this.props.dialogIsOpen}
        handleClose={this.handleClose}
        useUpdatedStyles
      >
        <Body>
          <PadAndCenter>
            <div style={styles.libraryBoundary}>
              <Heading1>{i18n.libraryExportTitle()}</Heading1>
              {this.displayFunctions()}
            </div>
          </PadAndCenter>
        </Body>
      </Dialog>
    );
  }
}

export const UnconnectedLibraryCreationDialog = LibraryCreationDialog;

export default connect(
  state => ({
    dialogIsOpen: state.shareDialog.libraryDialogIsOpen
  }),
  dispatch => ({
    onClose() {
      dispatch(hideLibraryCreationDialog());
    }
  })
)(LibraryCreationDialog);
