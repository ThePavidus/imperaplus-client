
import "./main.scss";

import * as React from "react";
import { connect } from "react-redux";
import { Grid, GridRow, GridColumn } from "../layout";

import { clear } from "../../common/message/message.actions";
import { openCloseNav } from "../../common/general/general.actions";
import { setLanguage } from "../../common/session/session.actions";
import { IState } from "../../reducers";

import { Button, ButtonProps, DropdownButton, MenuItem, Alert, Modal, Glyphicon } from "react-bootstrap";

import LinkString from "../../components/ui/strLink";

interface ILanguageSelectorProps {
    selectedLanguage: string;
    onLanguageSelect: (language: string) => void;
}

class LanguageSelector extends React.Component<ILanguageSelectorProps, void> {
    public render() {
        return <DropdownButton id="language" title={__("LANGUAGE")} >
            <MenuItem
                onClick={() => this.props.onLanguageSelect("en")}
                active={this.props.selectedLanguage === "en"}>
                {__("English")}
            </MenuItem>
            <MenuItem
                onClick={() => this.props.onLanguageSelect("de")}
                active={this.props.selectedLanguage === "de"}>
                {__("German")}
            </MenuItem>
        </DropdownButton>;
    }
}

interface ILayoutProps {
    message;
    clear: () => void;
    nav;
    content;
    pageContent;

    isNavOpen: boolean;
    language: string;

    openCloseNav: (state: boolean) => void;
    setLanguage: (language: string) => void;
}

export class Layout extends React.Component<ILayoutProps, void> {
    public render(): JSX.Element {
        let msg: JSX.Element;
        if (!!this.props.message) {
            msg = <Alert
                bsStyle={this.props.message.type}
                onDismiss={this._onClear}>
                <LinkString link={this.props.message.message} />
            </Alert>;
        }

        return <div>
            <Grid className="layout">
                <GridRow className="header">
                    <GridColumn className="col-xs-10 col-sm-5 logo">
                        <img src="/assets/logo_150.png" />
                    </GridColumn>

                    {/* Responsive Navigation */}
                    <GridColumn className="col-xs-2 col-sm-7 mobile-navigation visible-xs-block">
                        {this.props.isNavOpen && <div className="mobile-nav">
                            <Grid>
                                <GridRow className="text-right">
                                    <LanguageSelector
                                        selectedLanguage={this.props.language}
                                        onLanguageSelect={this._onLanguageSelect} />

                                    <Button onClick={() => this.props.openCloseNav(false)}>
                                        <Glyphicon glyph="menu-hamburger" />
                                    </Button>
                                </GridRow>

                                <GridRow>
                                    {this.props.nav}
                                </GridRow>
                            </Grid>
                        </div>}

                        <Button onClick={() => this.props.openCloseNav(true)}>
                            <Glyphicon glyph="menu-hamburger" />
                        </Button>
                    </GridColumn>

                    <GridColumn className="col-xs-7 col-lg-7 navigation-container hidden-xs">
                        <div className="lang">
                            <LanguageSelector
                                selectedLanguage={this.props.language}
                                onLanguageSelect={this._onLanguageSelect} />
                        </div>

                        <div className="navigation">
                            {this.props.nav}
                        </div>
                    </GridColumn>
                </GridRow>

                <GridRow>
                    {msg}
                </GridRow>

                <GridRow className="content">
                    <GridColumn className="col-xs-12 main-content">
                        {this.props.content}
                    </GridColumn>
                </GridRow>

                <GridRow className="footer">
                    2003-2017 &copy; Christopher Schleiden and the Impera team. All Rights Reserved. <a href="#">Privacy Policy</a> | <a href="#">Terms of Service</a> | <a href="#">User Voice</a>
                </GridRow>
            </Grid>
            {this.props.pageContent}
        </div >;
    }

    private _onLanguageSelect = (language: string) => {
        this.props.setLanguage(language);
    }

    private _onClear = () => {
        this.props.clear();
    }
}

export default connect((state: IState) => ({
    message: state.message.data.message,
    isNavOpen: state.general.data.isNavOpen,
    language: state.session.data.language
}), (dispatch) => ({
    clear: () => { dispatch(clear(null)); },
    openCloseNav: (state: boolean) => { dispatch(openCloseNav(state)); },
    setLanguage: (language: string) => { dispatch(setLanguage(language)); }
}))(Layout);