var Asset = require('../models/asset.model.js');
var firebase  = require('../../firebase')
var shortid = require('shortid');
var mkdirp = require('mkdirp');
var fs = require('fs');

function userIsOwner(id, email) {
    Asset.findOne({'_id': id}, function(err, asset) {
        console.log("Validating Asset:")
        console.log(asset.owner)
        if(asset.owner != email){
            console.log("Invalid Owner Email")
            return false
        }
    })
    return true;
}


exports.create = function(req, res) {
    firebase.authenticateToken(req.headers.authorization).then(({ email, name}) => {
        if({ email, name}) {

            // Iterate over each file in the request
            for(file in req.files) {
                var asset = new Asset({
                    name: file.filename,
                    uploadedOnDate: new Date().toLocaleDateString("en-US"),
                    owner: email,
                    type: file.mimetype
                    
                });
            }
                
            asset.save(function(err, data) {
                if(err) {
                    console.log(err);
                    res.status(500).send({message: "Some error occurred while creating the Asset."});
                } else {
                    console.log('Asset saved')
                    res.send(data);
                }
            });
        }
    })
};

exports.delete = function(req, res) {
    console.log(req.headers)
    firebase.authenticateToken(req.headers.authorization).then(({ email, name}) => {
        if({ email, name}) {
            if(userIsOwner(req.headers.id, email)) {
                Asset.findOneAndDelete({'_id': req.headers.id}, function(err, asset) { 
                    if(err) {
                        console.log(err);
                        res.status(500).send({message: "Some error occurred while deleting the Asset."});
                    } else {
                        console.log('Asset deleted');
                        res.send(asset);
                    }
                })
            } else {
                res.status(403).send('Forbidden: Invalid Owner Email');
            }
        }
    })
};


exports.findOne = function(req, res) {
    Asset.findOne({'_id': req.params.id}, function(err, asset) {
        if(err) {
            console.log(err);
            if(err.kind === 'ObjectId') {
                return res.status(404).send({message: "Asset not found with id " + req.params.id});
            }
            return res.status(500).send({message: "Error retrieving asset with id " + req.params.id});
        }

        if(!asset) {
            return res.status(404).send({message: "Asset not found with id " + req.params.id});
        }

        res.send(asset);
    });
};

exports.findAll = function(req, res) {
    firebase.authenticateToken(req.headers.authorization).then(({ email, name}) => {
        if({ email, name}) {
            Asset.find({'owner': req.params.owner}, function(err, assets){
                if(err){
                    console.log(err)
                    return res.status(500).send({message: "Some error occurred while retrieving assets."});
                }
                else if(!assets) {
                    return res.status(404)
                }
                else {
                    return res.send(assets);
                }
            });
        }
    })
};
