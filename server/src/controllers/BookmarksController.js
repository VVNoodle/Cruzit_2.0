const { Bookmark, Project } = require("../models/");
const _ = require("lodash");

module.exports = {
	async index(req, res) {
		try {
			console.log("req.user", req.user.id);
			const {projectId} = req.query;
			let where = {
				UserId: req.user.id
			};
			if(projectId) {
				where.ProjectId = projectId;
			}
			console.log("WHERE: ", where);
			const bookmark = await Bookmark.findAll({
				where,
				include: [
					{
						model: Project
					}
				]
			})
				.map(bookmark => bookmark.toJSON())
				.map(bookmark => _.extend({}, bookmark.Project, bookmark));
			console.log("FINAL BOOKMARK: ", bookmark);
			res.send(bookmark);
		} catch (err) {
			// user already exists
			res.status(404).send({
				error: "An error has occurred when trying to fetch the bookmarks."
			});
		}
	},
	async post(req, res) {
		try {
			const {projectId} = req.body;
			console.log("toots",req.user.id);
			const bookmark = await Bookmark.findOne({
				where: {
					UserId: req.user.id,
					ProjectId: projectId
				}
			});
			if(bookmark) {
				return res.status(400).send({
					error: "You already have this project bookmarked"
				});
			}
			const newBookmark = await Bookmark.create({
				ProjectId: projectId,
				UserId: req.user.id
			});
			res.send(newBookmark);
		} catch (err) {
			// user already exists
			res.status(404).send({
				error: "An error has occurred when trying to create a bookmark."
			});
		}
	},
	async delete(req, res) {
		try {
			const {bookmarkId} = req.params;
			const bookmark = await Bookmark.findOne({
				where: {
					id: bookmarkId,
					UserId: req.user.id
				}
			});
			console.log("bookmarkid: " + bookmarkId);
			console.log("todelete:", bookmark);
			if(!bookmark) {
				res.status(403).send({
					error: "You don't have access to this bookmark"
				});
			}
			await bookmark.destroy();
			res.send(bookmark);
		} catch (err) {
			// user already exists
			console.log(err);
			res.status(404).send({
				error: "An error has occurred when trying to delete the bookmark."
			});
		}
	},
};