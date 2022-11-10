const ImagesCalculator = require("../utils/ImagesCalculator.js")


function mockRelease({tag_name, created_at, prerelease}){

  return {

    "url": "https://api.github.com/repos/octocat/Hello-World/releases/1",
    "html_url": "https://github.com/octocat/Hello-World/releases/v1.0.0",
    "assets_url": "https://api.github.com/repos/octocat/Hello-World/releases/1/assets",
    "upload_url": "https://uploads.github.com/repos/octocat/Hello-World/releases/1/assets{?name,label}",
    "tarball_url": "https://api.github.com/repos/octocat/Hello-World/tarball/v1.0.0",
    "zipball_url": "https://api.github.com/repos/octocat/Hello-World/zipball/v1.0.0",
    "id": 1,
    "node_id": "MDc6UmVsZWFzZTE=",
    tag_name,
    "target_commitish": "master",
    "name": "v1.0.0",
    "body": "Description of the release",
    "draft": false,
    prerelease,
    created_at,
    "published_at": "2013-02-27T19:35:32Z",
    "author": {
      "login": "octocat",
      "id": 1,
      "node_id": "MDQ6VXNlcjE=",
      "avatar_url": "https://github.com/images/error/octocat_happy.gif",
      "gravatar_id": "",
      "url": "https://api.github.com/users/octocat",
      "html_url": "https://github.com/octocat",
      "followers_url": "https://api.github.com/users/octocat/followers",
      "following_url": "https://api.github.com/users/octocat/following{/other_user}",
      "gists_url": "https://api.github.com/users/octocat/gists{/gist_id}",
      "starred_url": "https://api.github.com/users/octocat/starred{/owner}{/repo}",
      "subscriptions_url": "https://api.github.com/users/octocat/subscriptions",
      "organizations_url": "https://api.github.com/users/octocat/orgs",
      "repos_url": "https://api.github.com/users/octocat/repos",
      "events_url": "https://api.github.com/users/octocat/events{/privacy}",
      "received_events_url": "https://api.github.com/users/octocat/received_events",
      "type": "User",
      "site_admin": false
    },
  }
}

test('Images calculator works with filter for prereleases', () => {

  const MOCK_OCKTOKIT = {

    rest: {

      repos: {

        async listReleases(){

	  return { 

	    data: [

	    	mockRelease({tag_name: "v1.0.2-pre", prerelease: true, created_at: "2013-02-25T19:35:32Z"}),
	    	mockRelease({tag_name: "v2.0", prerelease: false, created_at: "2013-02-27T19:35:32Z"}),
	    	mockRelease({tag_name: "v1.0.5-pre", prerelease: true, created_at: "2013-02-27T19:35:32Z"}),
	    	mockRelease({tag_name: "v0.0.5-pre", prerelease: true, created_at: "2013-01-27T19:35:32Z"}),

	    ] 
	  }

        }

      }

    }

  }

  ImagesCalculator({
   
    action_type: "last_prerelease_v1.0.x",
   
  }, MOCK_OCKTOKIT, true)

  	.then(tag => expect(tag === "v1.0.5-pre"))

	.catch(e => console.error(e))
  
})

test('Images calculator works with filter for releases', () => {

  const MOCK_OCKTOKIT = {

    rest: {

      repos: {

        async listReleases(){

	  return { 

	    data: [

	    	mockRelease({tag_name: "v2.1", prerelease: false, created_at: "2013-02-28T19:35:32Z"}),
	    	mockRelease({tag_name: "v1.0.2-pre", prerelease: true, created_at: "2013-02-25T19:35:32Z"}),
	    	mockRelease({tag_name: "v2.0", prerelease: false, created_at: "2013-02-27T19:35:32Z"}),
	    	mockRelease({tag_name: "v1.0.5-pre", prerelease: true, created_at: "2013-02-27T19:35:32Z"}),
	    	mockRelease({tag_name: "v0.0.5-pre", prerelease: true, created_at: "2013-01-27T19:35:32Z"}),

	    ] 
	  }

        }

      }

    }

  }

  ImagesCalculator({
   
    action_type: "last_release_v2.x",
   
  }, MOCK_OCKTOKIT, true)

  	.then(tag => expect(tag === "v2.1"))

	.catch(e => console.error(e))
  
})
