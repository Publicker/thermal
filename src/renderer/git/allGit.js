import NodeGit, { Repository, Diff } from "nodegit";

export const getRepository = async path => {
	const repository = await Repository.open(path);
	return repository;
};

export const getCurrentBranch = async path => {
	const repo = await Repository.open(path);

	const currentBranch = await repo.getCurrentBranch();

	return currentBranch;
};

export const getCurrentBranchName = async path => {
	const repo = await Repository.open(path);

	const currentBranch = await repo.getCurrentBranch();

	return currentBranch.shorthand();
};

export const getStatus = async path => {
	const repo = await Repository.open(path);
	const statuses = await repo.getStatus();

	return statuses;
};

export const getDiff = async (path, pathFile) => {
	console.log("Get diff called");

	const repo = await NodeGit.Repository.open(path);

	// const commit = await repo.getReferenceCommit('HEAD');

	const commit = await repo.getHeadCommit();

	const entry = await commit.getEntry(pathFile);

	const blob = await entry.getBlob();

	blob.entry = entry;

	// Show the path, sha, and filesize in bytes.
	console.log(blob.entry.path() + blob.entry.sha() + blob.rawsize() + "b");

	// Show a spacer.
	console.log(Array(72).join("=") + "\n\n");

	// Show the entire file.
	console.log(String(blob));
};

export const getDiffFiles = async path => {
	const repo = await NodeGit.Repository.open(path);
	const head = await repo.getHeadCommit();
	if (!head) {
		return [];
	}
	// const diff = await Diff.treeToIndex(repo, await head.getTree(), null);
	const diff = await Diff.indexToWorkdir(repo, null, {
		flags:
			Diff.OPTION.SHOW_UNTRACKED_CONTENT | Diff.OPTION.RECURSE_UNTRACKED_DIRS
	});
	const patches = await diff.patches();
	console.log(patches);

	console.log(patches.map(patch => patch.lineStats()));
};

export const isGitRepo = async path => {
	const repo = await Repository.open(path);

	return !!repo;
};

export const gitLog = async path => {
	const repo = await Repository.open(path);

	// repo.getMasterCommit();
	const commit = await repo.getHeadCommit();

	// History returns an event.
	const history = commit.history(NodeGit.Revwalk.SORT.TIME);

	let logs = [];

	// History emits "commit" event for each commit in the branch's history
	history.on("commit", function(commit) {
		let objectCommit = {
			author_email: commit.author().email(),
			author_name: commit.author().name(),
			body: commit.body(),
			date: commit.date(),
			hash: commit.sha(),
			message: commit.message()
		};

		logs.push(objectCommit);
	});

	history.start();

	return logs;
};
