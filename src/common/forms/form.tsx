import * as React from "react";

import { connect } from "react-redux";
import { IImmutable } from "immuts";

import { IPromiseAction } from "../../lib/action";
import { submitForm, FormMode, resetForm, changeField } from "./forms.actions";
import { IForms, IForm } from "./forms.reducer";
import { contextTypes, IFormContext } from "./types";

/** User provided input */
interface IFormProps {
    component: (props: {
        isPending: boolean;
        formState: IForm;
        submit: () => void;
    }) => JSX.Element;

    name: string;

    onSubmit?: <TResult, TData>(formState: IForm, options) => any; // Should be thunk action
    onSubmitSuccess?: <TResult>(result: TResult) => void;
    onSubmitFailed?: <TError>(error: TError) => void;
}

interface IInternalFormProps {
    isPending: boolean;
    formState: IForm;

    submit: (formState: IForm) => any;
    reset: () => any;
    changeField: (fieldName: string, value: string | boolean | number) => any;
}

class Form extends React.Component<IFormProps & IInternalFormProps, void> {
    public static childContextTypes = contextTypes;

    public getChildContext(): IFormContext {
        return {
            formState: this.props.formState,
            changeField: this.props.changeField
        };
    }

    public componentDidMount() {
        // Initialize the form
        this.props.reset();
    }

    public render() {
        return <form onSubmit={this._onSubmit}>
            {this.props.component({
                isPending: this.props.isPending,
                formState: this.props.formState,
                submit: () => this.props.submit(this.props.formState)
            })}
        </form>;
    }

    private _onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        this.props.submit(this.props.formState);

        e.preventDefault();
        return false;
    }
}

export default connect((state: { forms: IImmutable<IForms> }, ownProps: IFormProps) => {
    return {
        formState: state.forms.data.forms[ownProps.name] || {
            name: ownProps.name,
            fields: {}
        } as IForm,
        isPending: state.forms.data.forms[ownProps.name] && state.forms.data.forms[ownProps.name].isPending || false
    };
}, (dispatch, ownProps: IFormProps) => ({
    submit: (formState: IForm) => {
        // Mark form as pending
        dispatch(submitForm(ownProps.name, FormMode.Pending));

        dispatch(ownProps.onSubmit(formState, {
            beforeSuccess: d => d(submitForm(ownProps.name, FormMode.Success)),
            beforeError: d => d(submitForm(ownProps.name, FormMode.Failed))
        }));
    },
    reset: () => dispatch(resetForm(ownProps.name)),
    changeField: (fieldName: string, value: string | boolean | number) => dispatch(changeField(ownProps.name, fieldName, value))
}))(Form);