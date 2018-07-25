class File
	constructor: (row, @item_list) ->
		@editable_title = null
		@status = "unknown"
		@menu = null
		@setRow(row)

	getRatioColor: (ratio) ->
		ratio_h = Math.min(ratio * 50, 145)
		ratio_s = Math.min(ratio * 100, 60)
		ratio_l = 80 - Math.min(ratio * 5, 30)

		return "hsl(#{ratio_h}, #{ratio_s}%, #{ratio_l}%)"

	setRow: (@row) ->
		@owned = Page.site_info.auth_address == @row.directory
		if @owned and not @editable_title
			@editable_title = new Editable("div.body", @handleTitleSave, @handleDelete)
			@editable_title.empty_text = " "

		if @row.stats.bytes_downloaded >= @row.size
			@status = "seeding"
		else if @row.stats.is_downloading
			@status = "downloading"
		else if 0 < @row.stats.bytes_downloaded < @row.size
			@status = "partial"
		else
			@status = "inactive"

	deleteFile: (cb) =>
		Page.cmd "optionalFileDelete", @row.inner_path, =>
			Page.cmd "optionalFileDelete", @row.inner_path + ".piecemap.msgpack", =>
				cb?(true)

	deleteFromContentJson: (cb) =>
		Page.cmd "fileGet", @row.content_inner_path, (res) =>
			data = JSON.parse(res)
			delete data["files_optional"][@row.file_name]
			delete data["files_optional"][@row.file_name+ ".piecemap.msgpack"]
			Page.cmd "fileWrite", [@row.content_inner_path, Text.fileEncode(data)], (res) =>
				cb?(res)

	deleteFromDataJson: (cb) =>
		Page.cmd "fileGet", @row.data_inner_path, (res) =>
			data = JSON.parse(res)
			delete data["file"][@row.file_name]
			delete data["file"][@row.file_name+ ".piecemap.msgpack"]
			Page.cmd "fileWrite", [@row.data_inner_path, Text.fileEncode(data)], (res) =>
				cb?(res)

	handleDelete: (cb) =>
		@deleteFile (res) =>
			@deleteFromContentJson (res) =>
				if not res == "ok"
					return cb(false)
				@deleteFromDataJson (res) =>
					if res == "ok"
						Page.cmd "sitePublish", {"inner_path": @row.content_inner_path}
						Page.list.update()
						cb(true)

	handleTitleSave: (title, cb) =>
		Page.cmd "fileGet", @row.data_inner_path, (res) =>
			data = JSON.parse(res)
			data["file"][@row.file_name]["title"] = title
			@row.title = title
			Page.cmd "fileWrite", [@row.data_inner_path, Text.fileEncode(data)], (res) =>
				if res == "ok"
					cb(true)
					Page.cmd "sitePublish", {"inner_path": @row.content_inner_path}
				else
					cb(false)

	handleNeedClick: =>
		@status = "downloading"
		Page.cmd "fileNeed", @row.inner_path + "|all", (res) =>
			console.log res
		return false

	handleOpenClick: =>
		Page.cmd "serverShowdirectory", ["site", @row.inner_path]
		return false

	handleMenuClick: =>
		if not @menu
			@menu = new Menu()
		@menu.items = []
		@menu.items.push ["Delete file", @handleMenuDeleteClick]
		@menu.toggle()
		return false

	handleMenuDeleteClick: =>
		@deleteFile()
		return false

	render: ->
		if @row.stats.bytes_downloaded
			ratio = @row.stats.uploaded / @row.stats.bytes_downloaded
		else
			ratio = 0

		ratio_color = @getRatioColor(ratio)

		if @status in ["downloading", "partial"]
			style = "box-shadow: inset #{@row.stats.downloaded_percent * 1.5}px 0px 0px #70fcd8"
		else
			style = ""

		ext = @row.file_name.toLowerCase().replace(/.*\./, "")
		if ext in ["mp4", "webm", "ogm"]
			type = "video"
		else
			type = "other"

		peer_num = Math.max((@row.stats.peer_seed + @row.stats.peer_leech) or 0, @row.stats.peer or 0)
		low_seeds = @row.stats.peer_seed <= peer_num * 0.1 and @row.stats.peer_leech >= peer_num * 0.2

		h("div.file.#{type}", {key: @row.id},
			h("div.stats", [
				h("div.stats-col.peers", {title: "Seeder: #{@row.stats.peer_seed}, Leecher: #{@row.stats.peer_leech}"}, [
					h("span.value", peer_num),
					h("span.icon.icon-profile", {style: if low_seeds then "background: #f57676" else "background: #666"})
				]),
				h("div.stats-col.ratio", {title: "Hash id: #{@row.stats.hash_id}"}, h("span.value", {"style": "background-color: #{ratio_color}"}, if ratio >= 10 then ratio.toFixed(0) else ratio.toFixed(1)))
				h("div.stats-col.uploaded", "\u2BA5 #{Text.formatSize(@row.stats.uploaded)}")
			])
			if type == "video"
				h("a.open", {href: @row.inner_path}, "\u203A")
			else
				h("a.open", {href: @row.inner_path}, h("span.icon.icon-open-new"))

			h("div.left-info", [
				if @editable_title?.editing
					@editable_title.render(@row.title)
				else
					h("a.title.link", {href: @row.inner_path, enterAnimation: Animation.slideDown}, @editable_title?.render(@row.title) or @row.title)

				h("div.details", [
					if @status in ["inactive", "partial"]
						h("a.add", {href: "#Add", title: "Download and seed", onclick: @handleNeedClick}, "+ seed")

					h("span.size", {classes: {downloading: @status == "downloading", partial: @status == "partial", seeding: @status == "seeding"}, style: style}, [
						if @status == "seeding"
							h("span", "seeding: ")
						if @status == "downloading" or @status == "partial" then [
							h("span.downloaded", Text.formatSize(@row.stats.bytes_downloaded)),
							" of "
						],
						Text.formatSize(@row.size)
					]),
					if @status != "inactive"
						[
							h("a.menu-button", {href: "#Menu", onclick: Page.returnFalse, onmousedown: @handleMenuClick}, "\u22EE")
							if @menu then @menu.render(".menu-right")
						]
					h("span.detail.added", {title: Time.date(@row.date_added, "long")}, Time.since(@row.date_added)),
					h("span.detail.uploader", [
						"by ",
						h("span.username",
							{title: @row.cert_user_id + ": " + @row.directory},
							@row.cert_user_id.split("@")[0]
						)
					]),
					if @status == "seeding"
						h("a.detail", h("a.link.filename", {href: "#Open+directory", title: "Open directory", onclick: @handleOpenClick}, @row.file_name))
					else
						h("a.detail.filename", {title: @row.file_name}, @row.file_name)
				])
			])
		)


window.File = File