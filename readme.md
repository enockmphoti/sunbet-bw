# Javascript use by the weblfow site.

This project allows you to load the javascript for webflow from this site.

once `git cloned` to a local folder run `npm install` to pull the dependent packages 

## The Javascript folder 

contains the code that would be included from the weblow website

## The root folder 

contains content used to run a webserver to serve content from the /javascript folder

this context is mapped to the root.

## The kubernetes folder 

artifacts used to run the web server in the Kubernetes cluster in staging.

## To run locally 

```sh
node index.js
```

You then should be able to load javascript on port 80

## To run from the staging aks clusters 

```cmd
start http://localhost/account.js
```

The javascript is available in the staging aks cluster

```cmd
start https://weapistg.sunbet.co.za/pub/int/sbetwebflowjs/account.js
```



