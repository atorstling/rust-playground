import React from 'react';
import PropTypes from 'prop-types';
import PureComponent from './PureComponent';
import { connect } from 'react-redux';
import Link from './uss-router/Link';

import {
  changeChannel,
  changeMode,
  performClippy,
  performCompileToAssembly,
  performCompileToLLVM,
  performCompileToMir,
  performExecute,
  performFormat,
  performGistSave,
  toggleConfiguration,
  navigateToHelp,
} from './actions';

function oneRadio(name, currentValue, possibleValue, change, labelText) {
  const id = `${name}-${possibleValue}`;
  return [
    <input className="header-set__radio" type="radio" name={name} id={id} key={`${id}-input`}
           checked={ currentValue === possibleValue } onChange={ () => change(possibleValue) } />,
    <label className="header-set__radio-label" htmlFor={id} key={`${id}-label`}>{labelText}</label>,
  ];
}

const executionLabel = (crateType, tests) => {
  if (tests) { return "Test"; }
  if (crateType === 'bin') { return "Run"; }
  return "Build";
};

class Header extends PureComponent {
  render() {
    const {
      execute, compileToAssembly, compileToLLVM, compileToMir,
      format, clippy, gistSave,
      channel, changeChannel, mode, changeMode,
      crateType, tests,
      toggleConfiguration, navigateToHelp,
    } = this.props;

    const oneChannel = (value, labelText) =>
            oneRadio("channel", channel, value, changeChannel, labelText);
    const oneMode = (value, labelText) =>
            oneRadio("mode", mode, value, changeMode, labelText);

    const primaryLabel = executionLabel(crateType, tests);

    const mirAvailable = channel === 'nightly' || channel === 'beta';

    return (
      <div className="header">
        <div className="header-compilation header-set">
          <button className="header-set__btn header-set__btn--primary"
                  onClick={ execute }>{ primaryLabel }</button>
          <div className="header-set__buttons header-set__buttons--primary">
            <button className="header-set__btn"
                    onClick={ compileToAssembly }>ASM</button>
            <button className="header-set__btn"
                    onClick={ compileToLLVM }>LLVM IR</button>
            { mirAvailable ?
              <button className="header-set__btn"
                        onClick={ compileToMir }>MIR</button>
              : null }
          </div>
        </div>

        <div className="header-tools header-set">
          <legend className="header-set__title">Tools</legend>
          <div className="header-set__buttons">
            <button className="header-set__btn"
                    onClick={() => format('default') }>Format</button>
            <Dropdown>
              <DropdownButton onClick={() => format('default')}>Default</DropdownButton>
              <DropdownButton onClick={() => format('rfc')}>Proposed RFC</DropdownButton>
            </Dropdown>
            <button className="header-set__btn"
                    onClick={ clippy }>Clippy</button>
          </div>
        </div>

        <div className="header-sharing header-set">
          <div className="header-set__buttons">
            <button className="header-set__btn"
                    onClick={ gistSave }>Gist</button>
          </div>
        </div>

        <div className="header-mode header-set">
          <legend className="header-set__title">Mode</legend>
          <div className="header-set__buttons header-set__buttons--radio">
            { oneMode("debug", "Debug") }
            { oneMode("release", "Release") }
          </div>
        </div>

        <div className="header-channel header-set">
          <legend className="header-set__title">Channel</legend>
          <div className="header-set__buttons header-set__buttons--radio">
            { oneChannel("stable", "Stable") }
            { oneChannel("beta", "Beta") }
            { oneChannel("nightly", "Nightly") }
          </div>
        </div>

        <div className="header-set">
          <div className="header-set__buttons">
            <button className="header-set__btn"
                    onClick={toggleConfiguration}>Config</button>
          </div>
        </div>

        <div className="header-set">
          <div className="header-set__buttons">
            <Link className="header-set__btn" action={navigateToHelp}>?</Link>
          </div>
        </div>
      </div>
    );
  }
}

Header.propTypes = {
  changeChannel: PropTypes.func.isRequired,
  changeMode: PropTypes.func.isRequired,
  channel: PropTypes.string.isRequired,
  clippy: PropTypes.func.isRequired,
  compileToAssembly: PropTypes.func.isRequired,
  compileToLLVM: PropTypes.func.isRequired,
  compileToMir: PropTypes.func.isRequired,
  execute: PropTypes.func.isRequired,
  format: PropTypes.func.isRequired,
  gistSave: PropTypes.func.isRequired,
  mode: PropTypes.string.isRequired,
  crateType: PropTypes.string.isRequired,
  tests: PropTypes.bool.isRequired,
  toggleConfiguration: PropTypes.func.isRequired,
  navigateToHelp: PropTypes.func.isRequired,
};

class Dropdown extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
    this.toggleOpen = () => {
      this.setState({ open: !this.state.open });
    };
  }

  render() {
    const { toggleOpen } = this;
    const { children } = this.props;
    const { open } = this.state;

    return (
      <div>
        <button className="header-set__btn drop" onClick={toggleOpen}>
          <span className="drop__toggle">▼</span>
        </button>
        <ul className={`drop__menu ${open ? 'drop__menu--open' : ''}`}>
          {React.Children.map(children, c => React.cloneElement(c, { toggleOpen }))}
        </ul>
      </div>
    );
  }
}

Dropdown.propTypes = {
  children: PropTypes.node.isRequired
};

const DropdownButton = ({ onClick, toggleOpen, children }) => (
  <li className="drop__menu-item">
    <button onClick={e => {toggleOpen(); onClick(e);}} className="drop__button">{children}</button>
  </li>
);

DropdownButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  toggleOpen: PropTypes.func,
  children: PropTypes.node.isRequired,
};

const mapStateToProps = ({ configuration: { channel, mode, crateType, tests } }) => (
  { channel, mode, crateType, tests, navigateToHelp }
);

const mapDispatchToProps = dispatch => ({
  changeChannel: channel => dispatch(changeChannel(channel)),
  changeMode: mode => dispatch(changeMode(mode)),
  clippy: () => dispatch(performClippy()),
  compileToAssembly: () => dispatch(performCompileToAssembly()),
  compileToLLVM: () => dispatch(performCompileToLLVM()),
  compileToMir: () => dispatch(performCompileToMir()),
  execute: () => dispatch(performExecute()),
  format: style => dispatch(performFormat(style)),
  gistSave: () => dispatch(performGistSave()),
  toggleConfiguration: () => dispatch(toggleConfiguration()),
});

const ConnectedHeader = connect(
  mapStateToProps,
  mapDispatchToProps
)(Header);

export default ConnectedHeader;
