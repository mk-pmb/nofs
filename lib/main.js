var Q = require('q');

fs = require('fs');
gfs = require('graceful-fs');

for (k in gfs) {
	fs[k] = gfs[k];
}

fsx = require('fs-extra');


// Denodeify fs.
// Now we can call fs.readFileQ with Q support.
for (k in fsx) {
	if (k.slice(-4) == 'Sync') {
		var name = k.slice(0, -4);
		fs[name + 'Q'] = Q.denodeify(fsx[name]);
	}
}

fs.moveQ = function (src, dest) {
	var defer = Q.defer();
	fsx.move(src, dest, function (err) {
		if (err)
			defer.reject(err);
		else
			defer.resolve();
	});
	return defer.promise;
}

fs.existsQ = function (path) {
	var defer = Q.defer();
	fs.exists(path, function (exists) {
		defer.resolve(exists);
	});
	return defer.promise;
}

fs.fileExists = function (path, cb) {
	fs.exists(path, function (exists) {
		if (exists) {
			fs.stat(path, function (err, stats) {
				cb(err, stats.isFile());
			});
		} else
			cb(null, false);
	});
}

fs.fileExistsSync = function (path) {
	if (fs.existsSync(path)) {
		return fs.statSync(path).isFile();
	} else
		return false;
}

fs.fileExistsQ = function (path) {
	var defer = Q.defer();
	fs.fileExists(path, function (err, exists) {
		if (err)
			defer.reject(err);
		else
			defer.resolve(exists);
	});
	return defer.promise
}

fs.dirExists = function (path, cb) {
	fs.exists(path, function (exists) {
		if (exists) {
			fs.stat(path, function (err, stats) {
				cb(err, stats.isDirectory());
			});
		} else
			cb(null, false);
	});
}

fs.dirExistsSync = function (path) {
	if (fs.existsSync(path)) {
		return fs.statSync(path).isDirectory();
	} else
		return false;
}

fs.dirExistsQ = function (path) {
	var defer = Q.defer();
	fs.dirExists(path, function (err, exists) {
		if (err)
			defer.reject(err);
		else
			defer.resolve(exists);
	});
	return defer.promise
}

module.exports = fs;