import * as React from "react";

import { connect } from "react-redux";
import { TournamentSummary, TournamentState} from "../../external/imperaClients";
import { Grid, GridRow, GridColumn } from "../../components/layout";
import { Title, Section } from "../../components/ui/typography";
import { TournamentList } from "../../components/ui/games/tournamentList";
import { Button, ButtonGroup } from "react-bootstrap";

import { IState } from "../../reducers";
import { refresh, join } from "../tournaments/tournaments.actions";
import { setDocumentTitle } from "../../lib/title";

export interface ITournamentGamesProps {
    refresh: () => void;
    join: () => void;

    openTournaments: TournamentSummary[];
    groupTournaments: TournamentSummary[];
    knockoutTournaments: TournamentSummary[];
    closedTournaments: TournamentSummary[];
}

export class TournamentsComponent extends React.Component<ITournamentGamesProps, void> {
    public componentDidMount() {
        this.props.refresh();

        setDocumentTitle(__("Tournaments"));
    }

    public render(): JSX.Element {
        let open: JSX.Element[];
        let group: JSX.Element[];
        let knockout: JSX.Element[];
        let closed: JSX.Element[];

        if (this.props.openTournaments.length > 0) {
            open = [<Section key="open-title">{__("Open")}</Section>,
                <TournamentList tournaments={this.props.openTournaments} key="open" />];
        }

        if (this.props.groupTournaments.length > 0) {
            group = [<Section key="group-title">{__("Running Groups")}</Section>,
                <TournamentList tournaments={this.props.groupTournaments} key="group" />];
        }

        if (this.props.knockoutTournaments.length > 0) {
            knockout = [<Section key="knockout-title">{__("Running Knockouts")}</Section>,
                <TournamentList tournaments={this.props.knockoutTournaments} key="knockout" />];
        }

        if (this.props.closedTournaments.length > 0) {
            closed = [<Section key="closed-title">{__("Closed")}</Section>,
                <TournamentList tournaments={this.props.closedTournaments} key="closed" />];
        }

        return <GridColumn className="col-xs-12">
            <Title>{__("Tournaments")}</Title>
            <div>
                <div className="pull-right">
                    <ButtonGroup>
                        <Button key="refresh" onClick={this.props.refresh} title={__("Refresh")}><span className="glyphicon glyphicon-refresh" /></Button>
                    </ButtonGroup>
                </div>

                {open}
                {group}
                {knockout}
                {closed}
            </div>
        </GridColumn>;
    }
}

export default connect((state: IState) => {
    const tournamentMap = state.tournaments.data.tournaments;
    const tournaments = Object.keys(tournamentMap).map(id => tournamentMap[id]);

    return {
        openTournaments: tournaments.filter(t => t.state === TournamentState.Open),
        groupTournaments: tournaments.filter(t => t.state === TournamentState.Groups),
        knockoutTournaments: tournaments.filter(t => t.state === TournamentState.Knockout),
        closedTournaments: tournaments.filter(t => t.state === TournamentState.Closed)
    };
}, (dispatch) => ({
    refresh: () => dispatch(refresh(null)),
    join: () => dispatch(join(null))
}))(TournamentsComponent);
