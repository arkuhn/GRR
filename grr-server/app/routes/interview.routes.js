
module.exports = function(app) {

    var interviews = require('../controllers/interview.controller.js');
 
    // Create a new interview
    app.post('/api/interviews', interviews.create);

    // Delete an interview
    app.delete('/api/interviews/', interviews.delete);

    // Retrieve all interviews for a given host
    app.get('/api/interviews/:host', interviews.findAll);

    // Retrieve a single interview with interviewId
    app.get('/api/interview/:id', interviews.findOne);
    
    // Update a interview with interviewId
    app.put('/api/interviews/', interviews.update);

}
