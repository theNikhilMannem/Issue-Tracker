'use strict';

const Issue = require('../models.js').Issue
const Project = require('../models.js').Project
// console.log(Issue, Project)
const ObjectId = require('mongoose').Types.ObjectId

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let project = req.params.project;
      
      const { _id, issue_title, issue_text, created_by, assigned_to, status_text, created_on, updated_on } = req.query

      Project.aggregate([
        { $match: { name: project } },
        { $unwind: "$issues" },
        _id ? { $match: { "issues._id": ObjectId(_id) } } : { $match: {} },
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
          // console.log('GET: ..there there!')
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
      
      const { _id, issue_title, issue_text, created_by, assigned_to, status_text, open } = req.body

      if (!_id) {
        res.json({
          error: 'missing _id'
        })
        return
      }
      
      if (!issue_title && !issue_text && !created_by && !assigned_to && !status_text && !open) {
        res.json({
          error: 'no update field(s) sent',
          '_id': _id
        })
        return
      }

      Project.findOne(
        { name: project },
        (err, projectFound) => {
          if (err || !projectFound) {
            res.json({ error: 'could not update', '_id': _id })
          }
          else {
            // const issue = projectFound.issues.filter(eachIssue => eachIssue._id == _id)
            const issue = projectFound.issues.id(_id)
            // console.log('PUT: issue ', issue)
            
            if (!issue) {
              res.json({ error: 'could not update', '_id': _id })
              return
            }

            issue.issue_title = issue_title || issue.issue_title
            issue.issue_text = issue_text || issue.issue_text
            issue.created_by = created_by || issue.created_by
            issue.assigned_to = assigned_to || issue.assigned_to
            issue.status_text = status_text || issue.status_text
            issue.open = open
            issue.updated_on = new Date()

            projectFound.save((err, projectSaved) => {
              if (err || !projectSaved) {
                res.json({ error: 'could not update', '_id': _id })
              }
              else {
                res.json({ result: 'successfully updated', '_id': _id })
              }
            })
          }
        }
      )
    })
    
    .delete(function (req, res){
      let project = req.params.project;
      
      const { _id } = req.body

      if (!_id) {
        res.json({ error: 'missing _id' })
        return
      }

      Project.findOne({ name: project }, (err, projectFound) => {
        if (err || !projectFound) {
          res.json({
            error: 'could not delete',
            _id: _id
          })
        }
        else {
          const issue = projectFound.issues.id(_id)
          
          if (!issue) {
            res.json({
              error: 'could not delete',
              _id: _id
            })
            return
          }

          issue.remove()
          
          projectFound.save((err, projectSaved) => {
            if (err || !projectSaved) {
              res.json({
                error: 'could not delete',
                _id: _id
              })
            }
            else {
              res.json({
                result: 'successfully deleted',
                _id: _id
              })
            }
          })
        }
      })
    });
    
};
