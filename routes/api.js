'use strict';

const Issue = require('../models.js').Issue
const Project = require('../models.js').Project
// console.log(Issue, Project)

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let project = req.params.project;
      
      const { _id, issue_title, issue_text, created_by, assigned_to, status_text, created_on, updated_on } = req.query

      Project.aggregate([
        { $match: { name: project } },
        { $unwind: "$issues" },
        // _id ? { $match: { "issues._id": _id } } : { $match: {} },
        issue_title ? { $match: { "issues.issue_title": issue_title } } : { $match: {} },
        issue_text ? { $match: { "issues.issue_text": issue_text } } : { $match: {} },
        created_by ? { $match: { "issues.created_by": created_by } } : { $match: {} },
        assigned_to ? { $match: { "issues.assigned_to": assigned_to } } : { $match: {} },
        status_text ? { $match: { "issues.status_text": status_text } } : { $match: {} }
      ]).exec(async (err, aggrData) => {
        if (err || !aggrData) {
          res.json([])
        }
        else {
          console.log('GET: there there!')
          res.json(await aggrData.map(proj => proj.issues))
        }
      })
    })
    
    .post(function (req, res){
      let project = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body

      if (!issue_title || !issue_text || !created_by) {
        res.json({ error: 'required field(s) missing' })
        return
      }

      const issue = new Issue({
        issue_title,
        issue_text,
        created_by,
        assigned_to: assigned_to || '',
        status_text: status_text || '',
        created_on: new Date(),
        updated_on: new Date(),
        open: true
      })

      Project.findOne({ name: project }, (err, projectFound) => {
        if (err) {
          console.log('Error in finding the project', err)
        }
        else if (!projectFound) {
          const projectNew = new Project({ name: project })
          projectNew.issues.push(issue)
          projectNew.save((err, issueSaved) => {
            if (err || !issueSaved) {
              console.log('POST: Error in saving the issue in New Project!')
            }
            else {
              res.json(issue)
            }
          })
        }
        else {
          projectFound.issues.push(issue)

          projectFound.save((err, issueSaved) => {
            if (err || !issueSaved) {
              console.log('POST: Error in saving the issue in Existing Project!')
            }
            else {
              res.json(issue)
            }
          })
        }
      })
    })
    
    .put(function (req, res){
      let project = req.params.project;
      
    })
    
    .delete(function (req, res){
      let project = req.params.project;
      
    });
    
};
