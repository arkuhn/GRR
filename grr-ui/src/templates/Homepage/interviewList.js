import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PresenceVRNavBar from "../PresenceVRNavBar/PresenceVRNavBar"
import { Button, Header, Card, Grid, Modal, List, Input, Image, Loader, Dimmer, Divider } from 'semantic-ui-react';
import InterviewAPI from '../../utils/InterviewAPI';
import InterviewCard from '../InterviewCard/interviewCard'
import InterviewForm from '../InterviewCard/InterviewForm';
import _ from 'lodash';
import { firebaseAuth } from '../../utils/firebase';


class InterviewList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            interviews: [],
            loading: false
        }
        this.updateList = this.updateList.bind(this);
        this.populateHostList = this.populateHostList.bind(this);
        this.populateNonHostList = this.populateNonHostList.bind(this);
    }

    updateList() {
        this.setState({loading: true})
        InterviewAPI.getAllInterviews(this.props.hostEmail).then((interviews) => {  
            this.setState({interviews: interviews.data});
            this.setState({loading: false})
        });
    }

    componentDidMount() {
        this.updateList()
    }

    populateHostList() {
        if (this.state.loading) {
            return (<div>
                <br/>
                <br/>
                <Dimmer active inverted>
                    <Loader> Loading schedule </Loader>
                </Dimmer>
            </div>)
        }
        if (this.state.interviews.length === 0) {
            return (
            <List.Item>
            <List.Content>
                <List.Header>No interviews to show!</List.Header>
            </List.Content>
            </List.Item>)
        }
    
        return this.state.interviews.map((interview) => {
            let face = '';
            let hosting = false;
            if (interview.host === firebaseAuth.currentUser.email) {
                face = firebaseAuth.currentUser.photoURL;
                hosting = true;
            }
            if (interview.host === firebaseAuth.currentUser.email) {
                return  (  
                    <InterviewCard participants={interview.participants} 
                                    details={interview.details}
                                    date={interview.occursOnDate} 
                                    time={interview.occursAtTime}
                                    image={face} 
                                    icon='calendar alternate outline'
                                    id={interview._id}
                                    host={hosting} />
                )
            }
        })
    }

    populateNonHostList() {
        if (this.state.loading) {
            return (<div>
                <br/>
                <br/>
                <Dimmer active inverted>
                    <Loader> Loading schedule </Loader>
                </Dimmer>
            </div>)
        }
        if (this.state.interviews.length === 0) {
            return (
            <List.Item>
            <List.Content>
                <List.Header>No interviews to show!</List.Header>
            </List.Content>
            </List.Item>)
        }
    
        return this.state.interviews.map((interview) => {
            let face = '';
            let hosting = false;
            if (interview.host === firebaseAuth.currentUser.email) {
                face = firebaseAuth.currentUser.photoURL;
                hosting = true;
            }
            if (interview.host !== firebaseAuth.currentUser.email) {
                return  (  
                    <InterviewCard participants={interview.participants} 
                                    details={interview.details}
                                    date={interview.occursOnDate} 
                                    time={interview.occursAtTime}
                                    image={face} 
                                    icon='calendar alternate outline'
                                    id={interview._id}
                                    host={hosting} />
                )
            }
        })
    }

    render() {
        return (
            <div>
                <Grid centered divided>
                    <Grid.Row>
                        <Grid.Column width={8}>
                            <Header as='h2'>
                                <Header.Content>
                                    Hosted Interviews
                                </Header.Content>
                            </Header>
                            <Divider />
                        </Grid.Column>
                        <Grid.Column width={8}>
                            <Header as='h2'>
                                <Header.Content>
                                    Participating Interviews
                                </Header.Content>
                            </Header>
                            <Divider />
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                        <Grid.Column width={8}>
                            {this.populateHostList()}
                        </Grid.Column>

                        <Grid.Column width={8}>
                            {this.populateNonHostList()}
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </div>
        )
    }
}

export default InterviewList;