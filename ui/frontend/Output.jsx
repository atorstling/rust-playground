import React, { PropTypes } from 'react';

const hasProperties = (obj) => Object.values(obj).some(val => val);

function Tab(props) {
  const { kind, focus, label, onClick, tabProps } = props;

  if (hasProperties(tabProps)) {
    const selected = focus === kind ? "output-tab-selected" : "";
    return (
      <button className={`output-tab ${selected}`}
              onClick={props.onClick}>
        {label}
      </button>
    );
  } else {
    return null;
  }
}

function Section(props) {
  const { kind, label, content } = props;

  if (content) {
    return (
      <div className={`output-${kind}`}>
        <span className="output-header">{label}</span>
        <pre><code>{content}</code></pre>
      </div>
    );
  } else {
    return null;
  }
}

function SimplePane(props) {
  const { focus, kind, stdout, stderr, error } = props;

  if (focus === kind) {
    return (
      <div className={`output-${kind}`}>
        <Section kind='error' label='Errors' content={error} />
        <Section kind='stderr' label='Standard Error' content={stderr} />
        <Section kind='stdout' label='Standard Output' content={stdout} />
      </div>
    );
  } else {
    return null;
  }
}

function PaneWithCode(props) {
  const { focus, kind, code, stdout, stderr, error } = props;

  if (focus === kind) {
    return (
      <div className={`output-${kind}`}>
        <Section kind='error' label='Errors' content={error} />
        <Section kind='stderr' label='Standard Error' content={stderr} />
        <Section kind='stderr' label='Standard Output' content={stdout} />
        <Section kind='code' label='Result' content={code} />
      </div>
    );
  } else {
    return null;
  }
}

function Gist(props) {
  const { focus, id, url } = props;

  if (focus === 'gist') {
    return (
      <div className="output-gist">
        <p>
          <a href={`/?gist=${id}`}>Permalink to the playground</a>
        </p>
        <p>
          <a href={url}>Direct link to the gist</a>
        </p>
      </div>
    );
  } else {
    return null;
  }
}

export default class Output extends React.Component {
  render() {
    const {
      output: { meta: { focus }, execute, clippy, assembly, llvmIr, gist },
      changeFocus
    } = this.props;

    const somethingToShow = [execute, clippy, assembly, llvmIr, gist].some(hasProperties);

    if (!somethingToShow) {
      return null;
    }

    var close = null, body = null;
    if (focus) {
      close = (
        <button className="output-tab output-tab-close"
                onClick={() => changeFocus(null)}>Close</button>
      );

      body = (
        <div className="output-body">
          <SimplePane {...execute} kind="execute" focus={focus} />
          <SimplePane {...clippy} kind="clippy" focus={focus} />
          <PaneWithCode {...assembly} kind="asm" focus={focus} />
          <PaneWithCode {...llvmIr} kind="llvm-ir" focus={focus} />
          <Gist {...gist} focus={focus} />
        </div>
      );
    }

    return (
      <div className="output">
        <div className="output-tabs">
          <Tab kind="execute" focus={focus}
               label="Execution"
               onClick={() => changeFocus('execute')}
               tabProps={execute} />
          <Tab kind="clippy"
               focus={focus}
               label="Clippy"
               onClick={() => changeFocus('clippy')}
               tabProps={clippy} />
          <Tab kind ="asm" focus={focus}
               label="ASM"
               onClick={() => changeFocus('asm')}
               tabProps={assembly} />
          <Tab kind="llvm-ir" focus={focus}
               label="LLVM IR"
               onClick={() => changeFocus('llvm-ir')}
               tabProps={llvmIr} />
          <Tab kind="gist" focus={focus}
               label="Gist"
               onClick={() => changeFocus('gist')}
               tabProps={gist} />
          { close }
        </div>
        { body }
      </div>
    );
  }
};

const simpleProps = PropTypes.shape({
  stdout: PropTypes.string,
  stderr: PropTypes.string,
  error: PropTypes.string
});

const withCodeProps = PropTypes.shape({
  code: PropTypes.string,
  stdout: PropTypes.string,
  stderr: PropTypes.string,
  error: PropTypes.string
});

Output.propTypes = {
  meta: PropTypes.shape({
    requestsInProgress: PropTypes.number.isRequired,
    focus: PropTypes.string
  }),

  execute: simpleProps,
  clippy: simpleProps,
  llvmIr: withCodeProps,
  assembly: withCodeProps,

  gist: PropTypes.shape({
    id: PropTypes.string,
    url: PropTypes.string
  }),

  changeFocus: PropTypes.func.isRequired
};