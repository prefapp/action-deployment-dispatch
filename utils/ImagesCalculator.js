const github = require("@actions/github")

// String regexps
const FILTERED_RELEASE = new RegExp(/^last_release_(\w+)/)

const FILTERED_PRERELEASE = new RegExp(/^last_prerelease_(\w+)/)

// Utility function to escape special chars and compile into a RegExp dynamically
function utilRegEscape(string) {
    return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
};

module.exports = async function({action_type, flavour="default"}, ctx, mock){

  const image = await __calculateImage(action_type, ctx, mock)

  if(flavour){
    return `${image}_${flavour}`
  }
  else{
    return image
  }

}

  function __calculateImage(action_type, ctx, mock){

    const octokit = (mock) ? ctx : github.getOctokit(ctx.github_token)
  
    switch(action_type){
  
      case "last_prerelease":
        return __last_prerelease(octokit, ctx)
      case "last_release":
        return __last_release(octokit, ctx)
      default:
        if(FILTERED_PRERELEASE.test(action_type)){
          return __last_prerelease_filtered(octokit, ctx, action_type)
        }        
        else if(FILTERED_RELEASE.test(action_type)){
          return __last_release_filtered(octokit, ctx, action_type)
        }
        if(action_type.match(/^branch_/)){
  
          return __last_branch_commit(action_type, octokit, ctx)
        }
        else{
  
          return action_type
        }
    }
  }


  function __last_release(octokit, ctx){

    return octokit.rest.repos.getLatestRelease({
    
      owner: ctx.owner,

      repo: ctx.repo

    }).then((r) => {
 
      return r.data.tag_name

    })
    
  }

  function __last_prerelease(octokit, ctx){

    return __getReleases(octokit, ctx)

      .then(rr => rr.data.filter(r => r.prerelease)) // by prereleases

      .then(prereleases => __sortReleasesByTime(prereleases)[0]) // order by time (get the latest)

      .then(prerelease => prerelease ? prerelease.tag_name: name) // get the tag name

  }

  function __last_release_filtered(octokit, ctx, action_type){

    // we prepare the filter
    // is a regexp with the special part of .x replaced with .+ (any char)
    // thus last_prerelease_1.x => /^1.\.+/
    const filter_reg = new RegExp('^' + utilRegEscape(action_type.replace(/last_release_/, '').replace(/x/, '')))

    return __getReleases(octokit, ctx)

      .then(rr => rr.data.filter(r => !r.prerelease)) // by prereleases
 
      // match the filter
      .then((releases) => {

      	return releases.filter(r => filter_reg.test(r.tag_name)) 

      })

      .then(releases => __sortReleasesByTime(releases)[0]) // order by time (get the latest)

      .then(release => release.tag_name) // get the tag name

  }

  function __last_prerelease_filtered(octokit, ctx, action_type){

    // we prepare the filter
    // is a regexp with the special part of .x replaced with .+ (any char)
    // thus last_prerelease_1.x => /^1.\.+/
    const filter_reg = new RegExp('^' + utilRegEscape(action_type.replace(/last_prerelease_/, '').replace(/x/, '')))

    return __getReleases(octokit, ctx)

      .then(rr => rr.data.filter(r => r.prerelease)) // by prereleases
 
      // match the filter
      .then((prereleases) => {

      	return prereleases.filter(pr => filter_reg.test(pr.tag_name)) 

      })

      .then(prereleases => __sortReleasesByTime(prereleases)[0]) // order by time (get the latest)

      .then(prerelease => prerelease.tag_name) // get the tag name
  }

  function __getReleases(octokit, ctx){

    return octokit.rest.repos.listReleases({

      owner: ctx.owner,

      repo: ctx.repo

    })
  }

  function __sortReleasesByTime(releases){

    return releases.sort((a, b) => {

      return Date.parse(a.created_at) <= Date.parse(b.created_at)

    })

  }

  function __last_branch_commit(branch, octokit, ctx){

    return octokit.rest.repos.getBranch({
    
      owner: ctx.owner,

      repo: ctx.repo,

      branch: branch.replace(/^branch_/, "")
    
    }).then((b) => {
    
      //
      // we only use the first 8 chars of the commit's SHA for tagging
      //
      return b.data.commit.sha.substring(0, 7) 

    })

  }
