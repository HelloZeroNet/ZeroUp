class List extends Class
	constructor: ->
		@item_list = new ItemList(File, "id")
		@files = @item_list.items
		@need_update = true
		@loaded = false
		@type = "Popular"
		@limit = 10

	needFile: =>
		@log args
		return false

	update: =>
		@log "update"
		@loaded = false

		if @type == "Popular"
			order = "peer"
		else
			order = "date_added"

		if @search
			wheres = "WHERE file.title LIKE :search OR file.file_name LIKE :search"
			params = {search: "%#{@search}%"}
		else
			wheres = ""
			params = ""

		Page.cmd "dbQuery", ["SELECT * FROM file LEFT JOIN json USING (json_id) #{wheres} ORDER BY date_added DESC", params], (files_res) =>
			orderby = "time_downloaded DESC, peer DESC"
			if @type == "My"
				orderby = "is_downloaded DESC"
			else if @type == "Latest"
				orderby = "time_added DESC"
			Page.cmd "optionalFileList", {filter: "", limit: 1000, orderby: orderby}, (stat_res) =>
				stats = {}
				for stat in stat_res
					stats[stat.inner_path] = stat

				for file in files_res
					file.id = file.directory + "_" + file.date_added
					file.inner_path = "data/users/#{file.directory}/#{file.file_name}"
					file.data_inner_path = "data/users/#{file.directory}/data.json"
					file.content_inner_path = "data/users/#{file.directory}/content.json"
					file.stats = stats[file.inner_path]
					file.stats ?= {}
					file.stats.peer ?= 0
					file.stats.peer_seed ?= 0
					file.stats.peer_leech ?= 0

				if order == "peer"
					files_res.sort (a,b) ->
						return Math.min(5, b.stats["peer_seed"]) + b.stats["peer"] - a.stats["peer"] - Math.min(5, a.stats["peer_seed"])

				if @type == "Seeding"
					files_res = (file for file in files_res when file.stats.bytes_downloaded > 0)

				if @type == "My"
					files_res = (file for file in files_res when file.directory == Page.site_info.auth_address)

				@item_list.sync(files_res)
				@loaded = true
				Page.projector.scheduleRender()

	handleMoreClick: =>
		@limit += 20
		return false

	handleSearchClick: =>
		@is_search_active = true
		document.querySelector(".input-search").focus()
		return false

	handleSearchInput: (e) =>
		@search = e.currentTarget.value
		@update()
		return false

	handleSearchKeyup: (e) =>
		if e.keyCode == 27 # Esc
			if not @search
				@is_search_active = false
			e.target.value = ""
			@search = ""
			@update()
		return false

	handleSearchBlur: (e) =>
		if not @search
			@is_search_active = false


	render: =>
		if @need_update
			@update()
			@need_update = false

		h("div.List", {ondragenter: document.body.ondragover, ondragover: document.body.ondragover, ondrop: Page.selector.handleFileDrop, classes: {hidden: Page.state.page != "list"}}, [
			h("div.list-types", [
				h("a.list-type.search", {href: "#Search", onclick: @handleSearchClick, classes: {active: @is_search_active}},
					h("div.icon.icon-magnifier"),
					h("input.input-search", oninput: @handleSearchInput, onkeyup: @handleSearchKeyup, onblur: @handleSearchBlur)
				),
				h("a.list-type", {href: "?Popular", onclick: Page.handleLinkClick, classes: {active: @type == "Popular"}}, "Popular"),
				h("a.list-type", {href: "?Latest", onclick: Page.handleLinkClick, classes: {active: @type == "Latest"}}, "Latest"),
				h("a.list-type", {href: "?Seeding", onclick: Page.handleLinkClick, classes: {active: @type == "Seeding"}}, "Seeding"),
				h("a.list-type", {href: "?My", onclick: Page.handleLinkClick, classes: {active: @type == "My"}}, "My uploads"),
				# h("input.filter", {placeholder: "Filter uploads..."})
			]),
			h("a.upload", {href: "#", onclick: Page.selector.handleBrowseClick}, [h("div.icon.icon-upload"), h("span.upload-title", "Upload new file")]),
			if @files.length then h("div.files", [
				h("div.file.header",
					h("div.stats", [
						h("div.stats-col.peers", "Peers"),
						h("div.stats-col.ratio", "Ratio"),
						h("div.stats-col.downloaded", "Uploaded")
					])
				),
				@files[0..@limit].map (file) =>
					file.render()
			])
			if @loaded and not @files.length
				if @type == "Seeding"
					h("h2", "Not seeded files yet :(")
				else
					h("h2", "No files submitted yet")
			if @files.length > @limit
				h("a.more.link", {href: "#", onclick: @handleMoreClick}, "Show more...")
		])

window.List = List
