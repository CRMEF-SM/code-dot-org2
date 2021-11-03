import PropTypes from 'prop-types';
import React from 'react';
import color from '@cdo/apps/util/color';
import HelpTip from '@cdo/apps/lib/ui/HelpTip';
import TextareaWithMarkdownPreview from '@cdo/apps/lib/levelbuilder/TextareaWithMarkdownPreview';

const APP_DISPLAY_OPTIONS = {
  directly: 'Embed app with code directly',
  withCode: 'Display app with code from code field above'
};

export default function ExampleEditor({example, updateExample}) {
  return (
    <div>
      <label>
        Name
        <input
          value={example.name || ''}
          onChange={e => updateExample('name', e.target.value)}
          style={styles.textInput}
        />
      </label>
      <TextareaWithMarkdownPreview
        markdown={example.description || ''}
        label={'Description'}
        handleMarkdownChange={e => updateExample('description', e.target.value)}
        features={{imageUpload: true}}
      />
      <TextareaWithMarkdownPreview
        markdown={example.code || ''}
        label={'Code'}
        handleMarkdownChange={e => updateExample('code', e.target.value)}
        features={{imageUpload: true}}
      />
      <label>
        Example App
        <HelpTip>Sharing link for example app</HelpTip>
        <input
          value={example.app || ''}
          onChange={e => updateExample('app', e.target.value)}
          style={styles.textInput}
        />
      </label>
      <label>
        Example App Display Type
        <select
          value={example.appDisplayType}
          onChange={e => updateExample('appDisplayType', e.target.value)}
          style={styles.selectInput}
        >
          {Object.keys(APP_DISPLAY_OPTIONS).map(key => (
            <option key={key} value={key}>
              {APP_DISPLAY_OPTIONS[key]}
            </option>
          ))}
        </select>
        <HelpTip>
          How the app and code fields for this example are rendered
        </HelpTip>
      </label>
      <label>
        Example App iframe Embed Height
        <HelpTip>
          The height of the iframe, in pixels, to use when displaying an app
          with the "Embed app with code" display type
        </HelpTip>
        <input
          value={example.appEmbedHeight || ''}
          onChange={e => updateExample('appEmbedHeight', e.target.value)}
          style={styles.textInput}
        />{' '}
      </label>
    </div>
  );
}

ExampleEditor.propTypes = {
  example: PropTypes.object,
  updateExample: PropTypes.func
};

const styles = {
  textInput: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '4px 6px',
    color: '#555',
    border: `1px solid ${color.bootstrap_border_color}`,
    borderRadius: 4,
    margin: 0
  },
  selectInput: {
    boxSizing: 'border-box',
    padding: '4px 6px',
    color: '#555',
    border: `1px solid ${color.bootstrap_border_color}`,
    borderRadius: 4,
    marginLeft: 5,
    width: 350
  }
};
