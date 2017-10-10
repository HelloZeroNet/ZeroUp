class List extends Class
	constructor: ->
		@item_list = new ItemList(File, "id")
		@files = @item_list.items
		@need_update = true
		@loaded = false
		@order = "peer"


	needFile: =>
		@log args
		return false

	update: =>
		@log "update"
		Page.cmd "dbQuery", "SELECT * FROM file LEFT JOIN json USING (json_id) ORDER BY date_added DESC", (files_res) =>
			Page.cmd "optionalFileList", {filter: "", limit: 1000}, (stat_res) =>
				stats = {}
				for stat in stat_res
					stats[stat.inner_path] = stat

				for file in files_res
					file.id = file.directory + "_" + file.date_added
					file.inner_path = "data/users/#{file.directory}/#{file.file_name}"
					file.data_inner_path = "data/users/#{file.directory}/data.json"
					file.content_inner_path = "data/users/#{file.directory}/content.json"
					file.stats = stats[file.inner_path]
					file.stats ?= {"peer": 0}

				if @order == "peer"
					files_res.sort (a,b) ->
						return b.stats["peer"] - a.stats["peer"]

				@item_list.sync(files_res)
				@loaded = true
				Page.projector.scheduleRender()

	render: =>
		if @need_update
			@update()
			@need_update = false

		h("div.List", {ondragenter: document.body.ondragover, ondragover: document.body.ondragover, ondrop: Page.selector.handleFileDrop, classes: {hidden: Page.state.page != "list"}}, [
			if @order == "date_added"
				h("h1", "Latest uploads")
			else
				h("h1", "Popular uploads")
			h("a.upload", {href: "#", onclick: Page.selector.handleBrowseClick}, [h("div.icon.icon-upload"), h("span.upload-title", "Upload new file")]),
			if @files.length then h("div.files", [
				h("div.file.header",
					h("div.stats", [
						h("div.stats-col.peers", "Peers"),
						h("div.stats-col.ratio", "Ratio"),
						h("div.stats-col.downloaded", "Uploaded")
					])
				),
				@files.map (file) =>
					file.render()
			])
			if @loaded and not @files.length
				h("h2", "No files submitted yet")
		])

window.List = List