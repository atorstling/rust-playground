import React, { PropTypes } from 'react';
import {
  changeEditor, changeChannel, changeMode,
  performExecute, performCompileToAssembly, performCompileToLLVM,
  performFormat, performClippy, performSaveToGist,
  editCode, toggleConfiguration,
  changeFocus
} from './actions';
import { connect } from 'react-redux';

import Configuration from './Configuration.jsx';
import Header from './Header.jsx';
import Editor from './Editor.jsx';
import Output from './Output.jsx';

class Playground extends React.Component {
  render() {
    const { code,
            execute, compileToAssembly, compileToLLVM, format, clippy, saveToGist,
            configuration: { channel, mode, tests, editor, shown: showConfig },
            changeChannel, changeMode, onEditCode, changeEditor,
            toggleConfiguration,
            output, changeFocus
          } = this.props;

    const config = showConfig ? this.renderConfiguration() : null;

    const outputFocused = output.meta.focus ? 'playground-output-focused' : '';

    return (
      <div>
        { config }
        <div className="playground">
          <div className="playground-header">
            <Header execute={execute}
                    compileToAssembly={compileToAssembly}
                    compileToLLVM={compileToLLVM}
                    format={format} clippy={clippy} saveToGist={saveToGist}
                    channel={channel} changeChannel={changeChannel}
                    mode={mode} changeMode={changeMode}
                    tests={tests} toggleConfiguration={toggleConfiguration} />
          </div>
          <div className="playground-editor">
            <Editor editor={editor} code={code} onEditCode={onEditCode} />
          </div>
          <div className={`playground-output ${outputFocused}`}>
            <Output output={output} changeFocus={changeFocus} />
          </div>
        </div>
      </div>
    );
  }

  renderConfiguration() {
    const { configuration: { editor }, changeEditor, toggleConfiguration } = this.props;

    return (
      <div className="modal-backdrop">
        <div className="modal-content">
          <Configuration editor={editor}
                         changeEditor={changeEditor}
                         toggleConfiguration={toggleConfiguration} />
        </div>
      </div>
    );
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.output.meta.focus !== prevProps.output.meta.focus) {
      // Inform the ACE editor that its size has changed.
      try {
        window.dispatchEvent(new Event('resize'));
      } catch (ex) {
        // IE 11
        const evt = window.document.createEvent('UIEvents');
        evt.initUIEvent('resize', true, false, window, 0);
        window.dispatchEvent(evt);
      }
    }
  }
};

Playground.propTypes = {
  execute: PropTypes.func.isRequired,
  compileToAssembly: PropTypes.func.isRequired,
  compileToLLVM: PropTypes.func.isRequired,
  format: PropTypes.func.isRequired,
  saveToGist: PropTypes.func.isRequired,
  configuration: PropTypes.object.isRequired,
  changeChannel: PropTypes.func.isRequired,
  onEditCode: PropTypes.func.isRequired,
  code: PropTypes.string.isRequired
};

const mapStateToProps = (state) => {
  const { configuration, code, output } = state;
  return { configuration, code, output };
};

const mapDispatchToProps = (dispatch) => {
  return {
    toggleConfiguration: () => dispatch(toggleConfiguration()),
    changeEditor: (editor) => dispatch(changeEditor(editor)),
    changeChannel: (channel) => dispatch(changeChannel(channel)),
    changeMode: (mode) => dispatch(changeMode(mode)),
    changeFocus: (outputPane) => dispatch(changeFocus(outputPane)),
    execute: () => dispatch(performExecute()),
    compileToAssembly: () => dispatch(performCompileToAssembly()),
    compileToLLVM: () => dispatch(performCompileToLLVM()),
    format: () => dispatch(performFormat()),
    clippy: () => dispatch(performClippy()),
    saveToGist: () => dispatch(performSaveToGist()),
    onEditCode: (code) => dispatch(editCode(code))
  };
};

const ConnectedPlayground = connect(
  mapStateToProps,
  mapDispatchToProps
)(Playground);

export default ConnectedPlayground;