import React, { Component } from 'react';
import './LoginPage.css';
import { Link, Redirect } from 'react-router-dom';
import { Button, Header, Icon, Grid, Image, Card, Segment, Divider } from 'semantic-ui-react';
import {loginWithGoogle, firebaseAuth} from "../../utils/firebase";

class LoginPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loggedIn: false
        }
    }

    componentDidMount() {
        firebaseAuth.onAuthStateChanged((user) => {
            if (user){
                this.setState({loggedIn: true})
            }
        })
    }

    render() {
        if (this.state.loggedIn || firebaseAuth.currentUser) {
            return <Redirect to='/home' />
        }
        return (
            <div>
                <Grid centered>
                <Grid.Row/>
                    {/* Header */}
                    <Grid.Row>
                    <Grid.Column  width={4}>
                    <Header as='h1' textAlign='center'>
                        <Header.Content>
                        PresenceVR
                        <Header.Subheader>The future of virtual interviews and recruiting</Header.Subheader>
                        </Header.Content>
                    </Header>
                    </Grid.Column>
                    </Grid.Row>

                    <Grid.Row>
                        {/* Auth */}
                        <Grid.Column width={1} />
                        <Grid.Column width={5} floated='left'>
                        <Card fluid={true} raised={true}>
                            <Segment>
                            <Header as='h3'     textAlign='center'>
                            <Icon name='user' /> Log-in to your account
                            </Header>

                            <Button onClick={loginWithGoogle} fluid size='medium' basic color='red'>
                                <Icon name='google' />
                                Login with Google
                            </Button>

                            <Divider />

                            <Button as={Link} to="/home" fluid size='medium' basic color='blue'>
                                <Icon name='facebook' />
                                Login with Facebook
                            </Button>
                            </Segment>
                        </Card>
                        </Grid.Column>
                        <Grid.Column width={1} />

                        {/* Bio */}
                        <Grid.Column width={9 } floated='right'>
                            <Card fluid={true} >
                            <Card.Content>
                                <Image src='/assets/images/vrimage.png' />
                                <Card.Description>
                                    <span>
                                    Te eum doming eirmod, nominati pertinacia argumentum ad his. Ex eam alia facete scriptorem,
                                        est autem aliquip detraxit at. Usu ocurreret referrentur at, cu epicurei appellantur vix. Cum
                                        ea laoreet recteque electram, eos choro alterum definiebas in. Vim dolorum definiebas an. Mei
                                        ex natum rebum iisque.
                                    </span>
                                </Card.Description>
                                </Card.Content>
                                <Card.Content extra={true}>
                                    A R.I.T Career Services project
                                </Card.Content>
                            </Card>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </div>
        );
    }
}

export default LoginPage;