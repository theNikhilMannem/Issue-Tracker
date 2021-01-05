
const mongoose = require('mongoose')

const { Schema } = mongoose

const issueSchema = new Schema({
  issue_title: { type: String, required: true },
  issue_text: { type: String, required: true },
  created_by: { type: String, required: true },
  assigned_to: String,
  status_text: String,
  open: { type: Boolean, default: true },
  created_on: Date,
  updated_on: Date
})

const projectSchema = new Schema({
  name: { type: String, required: true },
  issues: [issueSchema]
})

const Issue = mongoose.model('Issue', issueSchema)
const Project = mongoose.model('Project', projectSchema)

exports.Issue = Issue
exports.Project = Project
