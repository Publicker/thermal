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

export const getDiff = async path => {
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
