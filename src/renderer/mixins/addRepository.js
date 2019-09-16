import git from "simple-git/promise";

// mixins
import queryAllRepository from "./queryAllRepository";

// database
import database from "../../database";

export default {
	data() {
		return {
			newRepository: {
				name: "",
				isGitRepo: false,
				remote: "",
				path: ""
			}
		};
	},
	mixins: [queryAllRepository],
	methods: {
		// add repository to database
		addRepositoryToDatabase(path) {
			this.getRepositoryName(path);
			this.getRemoteUrl(path);

			database.serialize(() => {
				this.insertNewRepository(path);

				// fetch lastest entry from repository database
				database.all(
					`SELECT * FROM repository ORDER BY repositoryId DESC LIMIT 1`,
					(err, data) => {
						if (err) console.log(err);
						else {
							let repositoryId = data;
							this.insertNewGitRepository(repositoryId);
							this.insertNewRepositorySettings(repositoryId);
							this.queryAllRepository();
						}
					}
				);
			});

			// reset local data property
			this.newRepository = {
				name: "",
				path: "",
				isGitRepo: false,
				remote: ""
			};
		},

		// directory name
		getRepositoryName(path) {
			this.newRepository.name = path.split("/")[path.split("/").length - 1];
		},

		// get remote url
		async getRemoteUrl(path) {
			let listRemote;
			try {
				listRemote = await git(path).listRemote(["--get-url"]);
				if (listRemote.slice(-4, -1) === "git") {
					this.newRepository.isGitRepo = true;
				}
				this.newRepository.remote = listRemote;

				console.log(listRemote);
			} catch (error) {
				console.log(error);
			}
		},

		// insert new repository to database
		insertNewRepository(path) {
			database.run(
				`INSERT INTO repository(
					repositoryName,
					repositoryPath
				) VALUES(
					$repositoryName,
					$repositoryPath
				);`,
				{
					$repositoryName: this.newRepository.name,
					$repositoryPath: path
				},
				(err, data) => {
					if (err) console.log(err);
				}
			);
		},

		// insert repository settings to database
		insertNewRepositorySettings(data) {
			database.run(
				`INSERT INTO repositorySettings(
					name,
					directoryName,
					directoryPath,
					commitFeature,
					remoteFeature,
					repositoryId
				) VALUES(
					$name,
					$directoryName,
					$directoryPath,
					$commitFeature,
					$remoteFeature,
					$repositoryId
				);`,
				{
					$name: data[0].repositoryName,
					$directoryName: data[0].repositoryName,
					$directoryPath: data[0].repositoryPath,
					$commitFeature: 1,
					$remoteFeature: 1,
					$repositoryId: data[0].repositoryId
				},
				(err, data) => {
					if (err) console.log(err);
				}
			);
		},

		// insert repository git to database
		insertNewGitRepository(data) {
			database.run(
				`INSERT INTO gitRepository(
					isGit,
					remoteUrl,
					repositoryId
				) VALUES(
					$isGitRepo,
					$remoteUrl,
					$repositoryId
				);`,
				{
					$isGitRepo: this.newRepository.isGitRepo,
					$remoteUrl: this.newRepository.remote,
					$repositoryId: data[0].repositoryId
				},
				(err, data) => {
					if (err) console.log(err);
				}
			);
		}
	}
};
