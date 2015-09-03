kit = require 'nokit'
kit.require 'drives'

module.exports = (task, option) ->

	task 'default build', ['clean'], 'build project', ->
		compile = ->
			kit.warp 'src/**'
			.load kit.drives.auto 'compile'
			.run 'dist'

		createDoc = ->
			kit.warp 'src/main.coffee'
			.load kit.drives.comment2md
				tpl: 'doc/readme.jst.md'
			.run()

		kit.async [
			compile()
			createDoc()
		]

	task 'lab l', 'lab', ->
		kit.monitorApp {
			bin: 'coffee'
			args: ['test/lab.coffee']
		}

	option '-a, --all', 'clean all'
	task 'clean', (opts) ->
		if opts.all
			kit.async [
				kit.remove 'dist'
				kit.remove '.nokit'
			]

	option '-g, --grep ["."]', 'test pattern', '.'
	task 'test', 'run unit tests', (opts) ->
		clean = ->
			kit.spawn 'git', ['clean', '-fd', kit.path.normalize('test/fixtures')]

		clean()
		.then ->
			kit.spawn('coffee', ['test/basic.coffee'])
		.then -> clean()
		.catch ({ code }) ->
			process.exit code
