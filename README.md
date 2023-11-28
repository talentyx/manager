﻿# Overview
NeuVector Security Center Admin Console for the SUSE NeuVector Container Security Platform.

A viewable version of docs can be seen at https://open-docs.neuvector.com

The images are on the NeuVector Docker Hub registry. Use the appropriate version tag for the manager, controller, enforcer, and leave the version as 'latest' for scanner and updater. For example:
+ neuvector/manager:5.0.0
+ neuvector/controller:5.0.0
+ neuvector/enforcer:5.0.0
+ neuvector/scanner:latest
+ neuvector/updater:latest

Note: Deploying from the Rancher Manager 2.6.5+ NeuVector chart pulls from the rancher-mirrored repo and deploys into the cattle-neuvector-system namespace.

# Build

```shell
# prebuild
make jar
# build docker images
make manager_image
```

# Bugs & Issues
Please submit bugs and issues to [neuvector/neuvector](//github.com/neuvector/neuvector/issues) with a title starting with `[UI] `.

Or just [click here](//github.com/neuvector/neuvector/issues/new?title=%5BUI%5D%20) to create a new issue.

# License

Copyright © 2016-2022 [NeuVector Inc](https://neuvector.com). All Rights Reserved

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

[http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
