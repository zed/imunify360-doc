# Imunify360 Stand-alone


Previously, Imunify360 had to be installed through a particular control panel, such as cPanel, DirectAdmin, or Plesk. Now, with version 4.5, it can be installed directly on the server, independent of any panel, regardless of the administrative interface. 

#### Beta Limitations

This version is released as beta and our product team is looking for feedback and possible issues.
You can drop any feedback to [feedback@imunify360.com](mailto:feedback@imunify360.com).

**Beta version limitations**

* No WebShield support yet (Captcha, GreyList and etc.)
* No support for managing disabled rules yet. See also: [Disabled rules](/dashboard/#disabled-rules)


#### Requirements

**Operating system**

* CentOS 6/7
* RHEL 6/7
* CloudLinux OS 
* Ubuntu 16.04/18.04

**Web servers**

* Apache
* LiteSpeed

#### There are four main steps in general required for having Imunify360 Stand-alone running on your server:

1. Install and configure the prerequisites like web servers modules or so
2. Configure Imunify360 integrations like authentication or <span class="notranslate">`mod_security`</span> configuration
3. Install Imunify360
4. Change default Imunify360 settings to reflect your needs

:::warning Warning
Imunify Web-UI PHP code has to be executed under a non-root user which has access to `/var/run/defence360agent/non_root_simple_rpc.sock`. If it runs in CageFS, you'll need to configure it accordingly.
:::


## 1. Prerequisites

Imunify360 Stand-alone version requires the following components installed or enabled at the server:

* ModSecurity 2.9.x
* Apache module <span class="notranslate">`mod_remoteip`</span>
* PHP with <span class="notranslate">`proc_open`</span> function enabled (remove it from the <span class="notranslate">`disable_functions`</span> list in <span class="notranslate">`php.ini`</span>)


## 2. Configure Imunify360 integrations

Imunify360 Stand-alone version require the following integrations before installation:

* Integration with web server for serving UI
* Integration with ModSecurity
* Integration with Malware scanner
* Integration with authentication service
* Define administrators for Imunify360

All integrations set in the integration config file like <span class="notranslate">`/etc/sysconfig/imunify360/integration.conf`</span>. You can find more details on config file [here](/stand_alone/#integration-config-file).

#### Integration with web server
      
Imunify360 UI is implemented as a single-page application (SPA) and requires a web server to serve it.
It’s required to specify a path to the web server directory, where the Imunify360 UI SPA application will be installed and served.
     
Example

<div class="notranslate">

``` ini
[paths]
ui_path = /var/www/vhosts/imunify360/imunify360.hosting.example.com/html/im360
```
</div>

Ensure that the domain you are going to use for the Imunify360 web-based UI refers to this path and that there are no other scripts or files under <span class="notranslate">`ui_path`</span>, as they might be overridden by Imunify360 installation.

#### Interaction with ModSecurity

Configure [ModSecurity configuration directives](https://github.com/SpiderLabs/ModSecurity/wiki/Reference-Manual-%28v2.x%29#Configuration_Directives) (so that it can block):

<div class="notranslate">

``` apacheconf
SecAuditEngine = "RelevantOnly"
SecConnEngine = "Off"
SecRuleEngine = "On"
```
</div>

Create the empty file <span class="notranslate">`/etc/sysconfig/imunify360/generic/modsec.conf`</span> and include it into the web server config as <span class="notranslate">`IncludeOptional`</span>. The file would be replaced with the actual config during the first Imunify360 installation or you can fill it via calling the Imunify360 ModSec ruleset installation <span class="notranslate">`imunify360-agent install-vendors`</span>.

Set the path and graceful restart script in the <span class="notranslate">`integration.conf`</span>

* <span class="notranslate">`[web_server].graceful_restart_script`​</span> – a script that restarts the web server to be called after any changes in web server config or ModSecurity rules
* <span class="notranslate">`[web_server].modsec_audit_log​`​</span> – a path to ModSecurity audit log file
* <span class="notranslate">`[web_server].modsec_audit_logdir​`​</span> – a path to ModSecurity audit log dir

Example

<div class="notranslate">

``` ini
[web_server]
server_type = apache
graceful_restart_script = /path/to/a/script/that/restarts/web-server/properly
modsec_audit_log = /var/log/httpd/modsec_audit.log
modsec_audit_logdir = /var/log/modsec_audit
```
</div>


To enable domain-specific ModSecurity configuration, specify the <span class="notranslate">`modsec_domain_config_script`</span> in the <span class="notranslate">`integration.conf`</span>.

<div class="notranslate">

``` ini
[web_server]
modsec_domain_config_script = /path/to/inject/domain/specific/config/script.sh
```
</div>
 
It should point to an executable file that accepts as an input a list of domain-specific web server settings and injects them into the server config. The standard input (stdin) is given in the [JSON Lines](http://jsonlines.org/) format similar to the following:

<div class="notranslate">

``` json
{"user": "username", "domain": "example.com", "config": "modsec config text"}
{"user": "another", "domain": "another.example.com", "config": "..."}
```
</div>
 
Each line contains config for a single domain e.g., it may contain rule tags excluded for the domain.
The script should also restart the web server to apply the configuration. This should be done so that the script could implement the check that web server comes up after config change, and reset configuration if it doesn't.

If configuration change failed, the script should return 1, and in the standard error stream (stderr) it should return the reason for failure. On success, the script should return 0.
In a single run of the script, we might update a single domain/user, as well as multiple users (all users) on the system.


#### Integration with malware scanner

To scan files uploaded via FTP, configure [PureFTPd](https://www.pureftpd.org/project/pure-ftpd/). Write in the <span class="notranslate">`pure-ftp.conf`</span>:

<div class="notranslate">

```
CallUploadScript             yes
```
</div>

To scan files for changes (to detect malware) using inotify, configure which directories to watch and which to ignore in the <span class="notranslate">`integration.conf`</span> file:

* configure <span class="notranslate">`[malware].basedir`</span> – a root directory to watch (recursively)
* configure <span class="notranslate">`[malware].pattern_to_watch`</span> – only directories that match this ([Python](https://docs.python.org/3/howto/regex.html#regex-howto)) regex in the basedir are actually going to be watched

Example

<div class="notranslate">

``` ini
basedir = /home
pattern_to_watch = ^/home/.+?/(public_html|public_ftp|private_html)(/.*)?$
```
</div>

#### Integration with authentication service

Imunify360 Stand-alone version can use PAM service to authenticate users for the Imunify360 UI application.

You can specify which PAM service Imunify360 should use with the <span class="notranslate">`service_name`</span> option:

<div class="notranslate">

``` ini
[pam]
service_name = system-auth
```
</div>

#### Define administrators for Imunify360

The administrators have full access to Imunify360 UI and its settings.

By default, <span class="notranslate">`root`</span> is considered to be the only <span class="notranslate">`admin`</span> user. 

To add more administrators, list them in the <span class="notranslate">`/etc/sysconfig/imunify360/auth.admin`</span> file 
or specify the admins option in the <span class="notranslate">`/etc/sysconfig/imunify360/integration.conf`</span>

Admin users will be merged from three sources: <span class="notranslate">`/etc/sysconfig/imunify360/auth.admin`</span> list and scripts defined in the
<span class="notranslate">`/etc/sysconfig/imunify360/integration.conf`</span> or <span class="notranslate">`/opt/cpvendor/etc/integration.ini`</span> that return user lists [Imunify 4.7+].

<div class="notranslate">

``` ini
[integration_scripts]
admins = /path/to/get-admins-script.sh
```
</div>

It should point to an executable file that generates a JSON file similar to the following:


<div class="notranslate">

``` json
{
  "data": [
    {
      "name": "admin1",
      "unix_user": "admin",
      "locale_code": "EN_us",
      "email": "admin1@domain.zone",
      "is_main": true
    },
	{
      "name": "admin2",
      "unix_user": "admin",
      "locale_code": "Ru_ru",
      "email": "admin2@domain.zone",
      "is_main": false
    },
  ],
  "metadata": {
    "result": "ok"
  }
}
```
</div>


## 3. Install Imunify360

The installation instructions are the same as for cPanel/Plesk/DirectAdmin version and can be found in the [Imunify360 documentation](/installation/#installation-instructions).

## 4. Settings related to Stand-alone version

The web-based UI is available via the domain configured in the <span class="notranslate">`ui_path`</span>.

For example, if <span class="notranslate">`/var/www/vhosts/imunify360/imunify360.hosting.example.com/html/im360`</span> is the document root folder for the <span class="notranslate">`imunify360.hosting.example.com`</span> domain, then you could open Imunify360 with the following URL:

* <span class="notranslate">`https://imunify360.hosting.example.com/`</span> (when you have TLS certificate configured for the domain) or
* <span class="notranslate">`http://imunify360.hosting.example.com/`</span>


#### 4.1 Use a specific list of users in Imunify360

By default, Imunify360 will use Linux system users, limited by <span class="notranslate">`uid_min`</span> and <span class="notranslate">`uid_max`</span> from the <span class="notranslate">`/etc/login.defs`</span>.

If you want to see a specific list of users (note, that all of them must be real Linux users accessible via PAM), you can specify the <span class="notranslate">`users`</span> option in the <span class="notranslate">`/etc/sysconfig/imunify360/integration.conf`</span>:


<div class="notranslate">

``` ini
[integration_scripts]
users = /path/to/get-users-script.sh
```
</div>


It should point to an executable file that generates a JSON file similar to the following (see details [here](/stand_alone/#integration-config-file)):


<div class="notranslate">

``` json
{
  "data": [
    {
      "id": 1000,
      "username": "ins5yo3",
      "owner": "root",
      "domain": "ins5yo3.com",
      "package": {
        "name": "package",
        "owner": "root"
      },
      "email": "ins5yo3@ins5yo3.com",
      "locale_code": "EN_us"
    },
    {
      "id": 1001,
      "username": "ins5yo4",
      "owner": "root",
      "domain": "ins5yo4.com",
      "package": {
        "name": "package",
        "owner": "root"
      },
      "email": "ins5yo4@ins5yo4.com",
      "locale_code": "EN_us"
    }
  ],
  "metadata": {
    "result": "ok"
  }
}
```
</div>

#### 4.2 Use server domains

To provide a list of domains for Imunify360, specify the script that generates a JSON file in the <span class="notranslate">`/etc/sysconfig/imunify360/integration.conf`</span>:

<div class="notranslate">

``` ini
[integration_scripts]
domains = /path/to/get-domains-script.sh
```
</div>

A JSON file should be similar to the following:

<div class="notranslate">

``` json
{
  "data": {
    "example.com": {
      "document_root": "/home/username/public_html/",
      "is_main": true,
      "owner": "username",
    },
    "subdomain.example.com": {
      "document_root": "/home/username/public_html/subdomain/",
      "is_main": false,
      "owner": "username",
    }
  },
  "metadata": {
    "result": "ok"
  }
}
```
</div>


<span class="notranslate">`web_server_config_path`</span> should point to a path that is added as <span class="notranslate">`IncludeOptional`</span> in this domain's virtual host e.g., <span class="notranslate">`/path/to/example.com/specific/config/to/include`</span> path should be added for the <span class="notranslate">`example.com`</span> domain.

## Integration config file

The documentation for the Imunify360 Stand-alone version integration configuration file format.

**Location** <span class="notranslate">`/etc/sysconfig/imunify360/integration.conf`</span>

**Parameters**

<div class="notranslate">

``` ini
[paths]
ui_path = /var/www/vhosts/imunify360/imunify360.hosting.example.com/html/im360
```
</div>

The path to the web server directory, where Imunify360 will be installed and served by web server. Need to be defined before Imunify360 installation.

<div class="notranslate">

``` ini
[pam]
service_name = system-auth
```
</div>

The PAM service is used for user authentication in the Imunify360 UI application.
By default the <span class="notranslate">`system-auth`</span> service is used.

<div class="notranslate">

``` ini
[integration_scripts]
admins = /path/to/get-admins-script.sh
```
</div>

The path to the executable script that generates a JSON file with the list of admin accounts.

<div class="notranslate">

``` json
{
  "data": [
    {
      "name": "admin1",
      "unix_user": "admin",
      "locale_code": "EN_us",
      "email": "admin1@domain.zone",
      "is_main": true
    },
	{
      "name": "admin2",
      "unix_user": "admin",
      "locale_code": "Ru_ru",
      "email": "admin2@domain.zone",
      "is_main": false
    },
  ],
  "metadata": {
    "result": "ok"
  }
}
```
</div>

<div class="notranslate">

``` ini
[integration_scripts]
users = /path/to/get-users-script.sh
```
</div>

The script to provide the specific list of users used by Imunify360.

It should point to an executable file that generates a JSON file similar to the following (domains are optional):

<div class="notranslate">

``` json
{
  "data": [
    {
      "id": 1000,
      "username": "ins5yo3",
      "owner": "root",
      "domain": "ins5yo3.com",
      "package": {
        "name": "package",
        "owner": "root"
      },
      "email": "ins5yo3@ins5yo3.com",
      "locale_code": "EN_us"
    },
    {
      "id": 1001,
      "username": "ins5yo4",
      "owner": "root",
      "domain": "ins5yo4.com",
      "package": {
        "name": "package",
        "owner": "root"
      },
      "email": "ins5yo4@ins5yo4.com",
      "locale_code": "EN_us"
    }
  ],
  "metadata": {
    "result": "ok"
  }
}
```
</div>

#### Data description

| | | |
|-|-|-|
|Key|Nullable|Description|
|<span class="notranslate">`id`</span>|<span class="notranslate">`False`</span>|ID of the UNIX account in the system.|
|<span class="notranslate">`username`</span>|<span class="notranslate">`False`</span>|The name of the UNIX account in the system.|
|<span class="notranslate">`owner`</span>|<span class="notranslate">`True`</span>|The name of the account owner. The owner can be an administrator (in this case he should be included in the <span class="notranslate">`admins()`</span> output) or a reseller (in this case he should be included in the <span class="notranslate">`resellers()`</span> output).|
|<span class="notranslate">`locale_code`</span>|<span class="notranslate">`True`</span>|The locale selected by a user.|
|<span class="notranslate">`email`</span>|<span class="notranslate">`True`</span>|Email of the account user. If there is no email, it should return null.|
|<span class="notranslate">`domain`</span>|<span class="notranslate">`True`</span>|The main domain of a user.|
|<span class="notranslate">`package`</span>|<span class="notranslate">`True`</span>|Information about the package to which a user belongs to. If the user doesn’t belong to any package, it should return null.|
|<span class="notranslate">`package.name`</span>|<span class="notranslate">`False`</span>|The name of the package to which a user belongs to.|
|<span class="notranslate">`package.owner`</span>|<span class="notranslate">`True`</span>|The owner of the package to which a user belongs to (reseller or administrator).|

<div class="notranslate">

``` ini
[integration_sctipts]
domains = /path/to/get-domains-script.sh
```
</div>

It should point to an executable file that generates a JSON file similar to the following

<div class="notranslate">

``` json
{
  "data": {
    "example.com": {
      "document_root": "/home/username/public_html/",
      "is_main": true,
      "owner": "username",
    },
    "subdomain.example.com": {
      "document_root": "/home/username/public_html/subdomain/",
      "is_main": false,
      "owner": "username",
    }
  },
  "metadata": {
    "result": "ok"
  }
}
```
</div>

<span class="notranslate">`web_server_config_path`</span> should point to a path that is added as <span class="notranslate">`IncludeOptional`</span> in this domain's virtual host e.g., <span class="notranslate">`/path/to/example.com/specific/config/to/include`</span> path should be added for the <span class="notranslate">`example.com`</span> domain.

<Disqus/>