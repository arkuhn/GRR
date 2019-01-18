import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PresenceVRNavBar from "../PresenceVRNavBar/PresenceVRNavBar"
import { Header, Modal, List, Icon, Button, Divider } from 'semantic-ui-react';
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css';
import { firebaseAuth } from '../../utils/firebase';

registerPlugin(FilePondPluginImagePreview);

function Asset(props) {
    return (
    <List.Item as='a'>
        <Icon name={props.icon} />
        <List.Content>
            <List.Header>{props.name}</List.Header>
            <List.Description>
            Uploaded on {props.date}
            </List.Description>
        </List.Content>
    </List.Item>
    )
}


function CustomFilePond(props) {
    return (
        <FilePond server={{
            process:(fieldName, file, metadata, load, error, progress, abort) => {
                return firebaseAuth.currentUser.getIdToken(true).then((token) => {
    
                    // fieldName is the name of the input field
                    // file is the actual file object to send
                    const formData = new FormData();
                    formData.append(fieldName, file, file.name);
    
    
                    const request = new XMLHttpRequest();
                    request.open('POST', '/api/assets/process');

                    // Set authentication token in header
                    request.setRequestHeader('authorization', token);
    
                    // Should call the progress method to update the progress to 100% before calling load
                    // Setting computable to false switches the loading indicator to infinite mode
                    request.upload.onprogress = (e) => {
                        progress(e.lengthComputable, e.loaded, e.total);
                    };
    
                    // Should call the load method when done and pass the returned server file id
                    // this server file id is then used later on when reverting or restoring a file
                    // so your server knows which file to return without exposing that info to the client
                    request.onload = function() {
                        if (request.status >= 200 && request.status < 300) {
                            // the load method accepts either a string (id) or an object
                            load(request.responseText);
                        }
                        else {
                            // Can call the error method if something is wrong, should exit after
                            error('oh no');
                        }
                    };
    
                    request.send(formData);
                
                    // Should expose an abort method so the request can be cancelled
                    return {
                        abort: () => {
                            // This function is entered if the user has tapped the cancel button
                            request.abort();
    
                            // Let FilePond know the request has been cancelled
                            abort();
                        }
                    };

                });
            }
        }}
        />
    );
}


class Assets extends Component {
    constructor(props) {
        super(props)
        this.state = {
            modalOpen: false
        }
        this.assets = []

        this.handleModelClose = this.handleModelClose.bind(this)
        this.handleModelOpen = this.handleModelOpen.bind(this)
        this.loadAssetsModal = this.loadAssetsModal.bind(this);
        this.generateAssets = this.generateAssets.bind(this)
    }
    handleModelClose() { 
        this.setState({ modalOpen: false })
    }

    handleModelOpen() {
        this.setState({ modalOpen: true})
    }

    loadAssetsModal() {
        return (
            <Modal trigger={ <Button fluid onClick={this.handleModelOpen} content='Load more'/> } open={this.state.modalOpen} onClose={this.handleClose} closeIcon>
                <Header icon='boxes' content='Select an asset to load' />
                <Modal.Content>
                    <List horizontal selection>
                    <br/>
                        {this.assets.map((asset)=> {
                            return <Asset name={asset.name} date={asset.date} icon='chevron right'/>
                        })}
                    </List>
                    <Divider />
                    <CustomFilePond />
                    <Button onClick={this.handleModelClose} fluid>Close</Button>
                </Modal.Content>
            </Modal>
        )    
    }
    generateAssets() {
        if (this.props.assets.length === 0) {
            return <p> No environments added!</p>
        }
        return this.props.assets.map((asset) => {
            return <Asset name={asset.name} date={'0/0/00'} icon='boxes'/>
        })
    }

    render() {
        this.assets= [] // Clear assets everytime this is re-rendered

        const css = ` 
        .AssetsList {
            height:250px;
            overflow:scroll;
            max-width: 100%;
            overflow-x: hidden;
        }
        `

        return (
            <div>
                <Header as='h3'>
                    <Icon name='boxes' />
                    Assets
                </Header>
                <List className="AssetsList">
                    {this.generateAssets()}
                </List>
                {this.loadAssetsModal()}
                <style>{css}</style>
            </div>
        );
    }
}

export default Assets;