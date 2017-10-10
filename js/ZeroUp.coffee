window.h = maquette.h

class ZeroUp extends ZeroFrame
	init: ->
		@bg = new Bg($("#Bg"))
		@state = {}
		@state.page = "list"
		@on_site_info = new Promise()


	createProjector: ->
		@projector = maquette.createProjector()
		@list = new List()
		@selector = new Selector()
		@uploader = new Uploader()
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
		else
			@log "Unknown command", cmd, params

window.Page = new ZeroUp()
window.Page.createProjector()