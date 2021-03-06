import React, { Component } from 'react';
import './InterviewPage.css';
import { Redirect } from 'react-router-dom';
import PresenceVRNavBar from "../PresenceVRNavBar/PresenceVRNavBar"
import Environments from "./environments";
import Assets from "./assets";
import Participants from "./participants";
import ChatPane from "./chat";
import AframeInterview from "./aframeInterview"
import { Grid, Header, Divider, Icon, Button } from 'semantic-ui-react';
import InterviewAPI from "../../utils/InterviewAPI";
import {firebaseAuth} from '../../utils/firebase'

class InterviewPage extends Component {
    constructor(props) {
        super(props);
        this.id = this.props.match.params.id;
        this.state = {interview: {
            participants: [],
            loadedEnvironments: [],
            loadedAssets: []
        }}

        this.updateInterview = this.updateInterview.bind(this);
    }

    updateInterview() {
        InterviewAPI.getInterview(this.id).then((data) => {
            console.log('got data');
            console.log(data.data);
            this.setState({
                interview: data.data
            });
        });
        console.log(this.state.interview);
        console.log("test");
    }

    componentDidMount() {
        this.updateInterview()
    }

    configuration() {
        return (
                <div>
                <Header as='h3'>
                    <Icon name='settings' />
                    Configuration
                </Header>
                <Button.Group>
                <Button>Edit Interview</Button>
                <Button.Or />
                <Button negative>Exit Interview</Button>
            </Button.Group>
            </div>
        );
    }

    render() {
        if (!firebaseAuth.currentUser) {
            return <Redirect to='/' />
        }
        return (
            <div className="InterviewPage">
                <PresenceVRNavBar/>
                <br/>
                <Grid centered divided>

                    {/* Header */}
                    <Grid.Row>
                        <Grid.Column  width={4}>
                        <Header as='h1' textAlign='center'>
                            <Header.Content>
                            Interview Name
                            <Header.Subheader>These are the interview details.</Header.Subheader>
                            </Header.Content>
                        </Header>
                        </Grid.Column>
                    </Grid.Row>
                    

                    {/* Left column*/}
                    <Grid.Column width={4}>
                        {/*Participants*/}
                        <Grid.Row>
                            <Participants participants={this.state.interview.participants}/>
                        </Grid.Row>

                        <Divider />
                        <Grid.Row>
                            {this.configuration()}
                        </Grid.Row>
                    </Grid.Column>


                    {/* Center Column*/}
                    <Grid.Column width={8}>
                        {/* Browser mode */}
                        <Grid.Row>
                            <AframeInterview />
                            <br/>
                            <br/>
                        </Grid.Row>
                        
                        <Divider/>
                        {/* Chat */}
                        <Grid.Row>
                            <ChatPane />
                        </Grid.Row>
                    </Grid.Column>


                    {/* Right column*/}
                    <Grid.Column width={4}>
                        {/* Environments */}
                        <Grid.Row>
                            <Environments environments={this.state.interview.loadedEnvironments}/>
                        </Grid.Row>
                        <Divider/>
                        {/* Assets */}
                        <Grid.Row>
                            <Assets assets={this.state.interview.loadedAssets}/>
                        </Grid.Row>
                    </Grid.Column>
                </Grid>
            </div>
        );
    }
}

export default InterviewPage;