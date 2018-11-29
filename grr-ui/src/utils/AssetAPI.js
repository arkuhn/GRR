import axios from 'axios';
import {API_URL} from "../templates/api.config";
import { firebaseAuth } from './firebase';

function getAsset(id) {
    return firebaseAuth.currentUser.getIdToken(true).then((token) => {
        let config = {headers: {Authorization: `${token}`}};
        return axios.get(API_URL + `/api/asset/${id}`, config).then((response) => {
            console.log('got a result');
            console.log(response);
            return response;
        }).catch((error) => {
            console.log(error);
        })
    })
}

function createAsset(data) {
    return firebaseAuth.currentUser.getIdToken(true).then((token) => {
        let config = {headers: {Authorization: `${token}`}};
        return axios.post(API_URL + '/api/assets', { data }, config).then((response) => {
            console.log('Asset created response');
            console.log(response);
            return response;
        }).catch((error) => {
            console.log(error);
        });
    })
}

function getAllAssets(id) {
    return firebaseAuth.currentUser.getIdToken(true).then((token) => {
        let config = {headers: {Authorization: `${token}`}};
        return axios.get(API_URL + `/api/assets/${id}`
        , config).then((response) => {
            console.log('Got all assets for host response');
            console.log(response);
            return response;
        }).catch((error) => {
            console.log(error);
        });
    })
}

function deleteAsset(id) {
    return firebaseAuth.currentUser.getIdToken(true).then((token) => {
        let config = {headers: {Authorization: `${token}`, id }};
        return axios.delete(API_URL + `/api/assets/`, config).then((response) => {
            console.log('Delete interview result');
            console.log(response);
            return response;
        }).catch((error) => {
            console.log(error);
        });
    })
}

export default {
    getAsset, createAsset, getAllAssets, deleteAsset
}