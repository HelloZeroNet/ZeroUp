window.h = maquette.h

class ZeroUp extends ZeroFrame
	init: ->
		@bg = new Bg($("#Bg"))
		@state = {}
		@state.page = "list"
		@on_site_info = new Promise()
		@on_loaded = new Promise()


	createProjector: ->
		@projector = maquette.createProjector()

		@list = new List()
		@selector = new Selector()
		@uploader = new Uploader()

		if base.href.indexOf("?") == -1
			@route("")
		else
			url = base.href.replace(/.*?\?/, "")
			@route(url)
			@history_state["url"] = url

		@projector.replace($("#List"), @list.render)
		@projector.replace($("#Uploader"), @uploader.render)

	setPage: (page_name) ->
		@state.page = page_name
		@projector.scheduleRender()

	setSiteInfo: (site_info) ->
		@site_info = site_info

	onOpenWebsocket: =>
		@updateSiteInfo()
		@cmd "serverInfo", {}, (@server_info) =>
			if @server_info.rev < 3090
				@cmd "wrapperNotification", ["error", "This site requires ZeroNet 0.6.0"]

	updateSiteInfo: =>
		@cmd "siteInfo", {}, (site_info) =>
			@address = site_info.address
			@setSiteInfo(site_info)
			@on_site_info.resolve()

	onRequest: (cmd, params) ->
		if cmd == "setSiteInfo" # Site updated
			@setSiteInfo(params)
			if params.event?[0] in ["file_done", "file_delete", "peernumber_updated"]
				RateLimit 1000, =>
					@list.need_update = true
					Page.projector.scheduleRender()
		else if cmd == "wrapperPopState" # Site updated
			if params.state
				if not params.state.url
					params.state.url = params.href.replace /.*\?/, ""
				@on_loaded.resolved = false
				document.body.className = ""
				window.scroll(window.pageXOffset, params.state.scrollTop or 0)
				@route(params.state.url or "")
		else
			@log "Unknown command", cmd, params

	# Route site urls
	route: (query) ->
		@params = Text.queryParse(query)
		@log "Route", @params

		@content = @list
		if @params.url
			@list.type = @params.url
		@content.limit = 10
		@content.need_update = true

		@projector.scheduleRender()

	setUrl: (url, mode="push") ->
		url = url.replace(/.*?\?/, "")
		@log "setUrl", @history_state["url"], "->", url
		if @history_state["url"] == url
			@content.update()
			return false
		@history_state["url"] = url
		if mode == "replace"
			@cmd "wrapperReplaceState", [@history_state, "", url]
		else
			@cmd "wrapperPushState", [@history_state, "", url]
		@route url
		return false

	handleLinkClick: (e) =>
		if e.which == 2
			# Middle click dont do anything
			return true
		else
			@log "save scrollTop", window.pageYOffset
			@history_state["scrollTop"] = window.pageYOffset
			@cmd "wrapperReplaceState", [@history_state, null]

			window.scroll(window.pageXOffset, 0)
			@history_state["scrollTop"] = 0

			@on_loaded.resolved = false
			document.body.className = ""

			@setUrl e.currentTarget.search
			return false


	# Add/remove/change parameter to current site url
	createUrl: (key, val) ->
		params = JSON.parse(JSON.stringify(@params))  # Clone
		if typeof key == "Object"
			vals = key
			for key, val of keys
				params[key] = val
		else
			params[key] = val
		return "?"+Text.queryEncode(params)

	returnFalse: ->
		return false


window.Page = new ZeroUp()
window.Page.createProjector()