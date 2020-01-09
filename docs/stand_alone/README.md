# How to run Imunify360 in stand-alone mode on a Linux server

::: tip Note
Prior to version 4.5, Imunify360 supported cPanel, Plesk, and
DirectAdmin control panels only. Starting from v4.5, Imunify360 could
be run on any CloudLinux OS, CentoOS 6/7, RHEL 6/7, and Ubuntu
16.04/18.04 systems without requiring any of these web panels to be
installed. Imunify360 can be run with any web panel, as the UI is
implemented using the single-page application (SPA) approach.
:::

Below you can find the steps to install and run Imunify360 in
stand-alone mode (without panel) or within any hosting panel.


#### What Imunify360 requires to run properly

There are some basic steps to run Imunify360
 as a stand-alone application.

1. Define a way to serve web-based UI
2. Configure a user authentication process
3. Implement integration scripts that provide Imunify360 with necessary information such as a list of users, domains hosted on
   the server, panel administrators, general panel info
4. Install prerequisites such as ModSecurity and remoteip web server modules
5. Configure ModSecurity integration
6. Configure malware scanner integration

:::warning Warning

Imunify Web-UI PHP code has to be executed under a user which has access to <span class="notranslate">`/var/run/defence360agent/non_root_simple_rpc.sock`</span>. If it runs in CageFS, you'll need to configure it accordingly.
:::


#### How to configure Imunify360 UI

Create the <span class="notranslate">`/etc/sysconfig/imunify360/integration.conf`</span> file with a
<span class="notranslate">`ui_path`</span> option defining the path that will serve web-based UI. For
example:

<div class="notranslate">

``` ini
[paths]
ui_path = /var/www/vhosts/imunify360/imunify360.hosting.example.com/html/im360
```
</div>

Imunify360 will automatically copy UI files there during installation/upgrade.

::: tip Note
Ensure that the domain you are going to use for the Imunify360
web-based UI refers to this path and that there are no other scripts
or files under <span class="notranslate">`ui_path`</span>, as they might be overridden by the Imunify360
installation.
:::


#### How to configure authentication for Imunify360 (optional)

Imunify360 can use PAM to authenticate users.
Once the UI is opened, the user sees a sign-in form. The credentials are checked via PAM.

You can specify which PAM service Imunify360 should use with the <span class="notranslate">`SERVICE_NAME`</span> option:

<div class="notranslate">

``` ini
[PAM]
SERVICE_NAME = system-auth
```
</div>


If it is not specified, the <span class="notranslate">`system-auth`</span> service is used.

By default, <span class="notranslate">`root`</span> is considered to be the only <span class="notranslate">`admin`</span> user.  To
add more administrators, list them in the <span class="notranslate">`/etc/sysconfig/imunify360/auth.admin`</span> file or specify the <span class="notranslate">`admins`</span>
option in the <span class="notranslate">`/etc/sysconfig/imunify360/integration.conf`</span>:

<div class="notranslate">

```
ini
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

#### How to provide Imunify360 with an actual list of users (optional)

By default, Imunify360 will use Linux system users, limited
by <span class="notranslate">`UID_MIN`</span> and <span class="notranslate">`UID_MAX`</span> from <span class="notranslate">`/etc/login.defs`</span>

If you want to see a specific list of users (note, that all of them
must be real Linux users accessible via PAM), you can specify the
<span class="notranslate">`users`</span> option in the <span class="notranslate">`/etc/sysconfig/imunify360/integration.conf`</span>:

<div class="notranslate">

``` ini
[integration_scripts]
users = /path/to/get-users-script.sh
```
</div>

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

::: tip Note
Any type of an executable file is acceptable. For example,
you can use a Python or PHP script.
:::


**Data description**

| | | |
|-|-|-|
|Key|Nullable|Description|
|<span class="notranslate">`id`</span>|<span class="notranslate">`False`</span>|ID of the UNIX account in the system.|
|<span class="notranslate">`username`</span>|<span class="notranslate">`False`</span>|The name of the UNIX account in the system.|
|<span class="notranslate">`owner`</span>|<span class="notranslate">`True`</span>|The name of the account owner in the control panel. The owner can be an administrator (in this case he should be included in the <span class="notranslate">`admins()`</span> output) or a reseller (in this case he should be included in the <span class="notranslate">`resellers()`</span> output).|
|<span class="notranslate">`locale_code`</span>|<span class="notranslate">`True`</span>|The control panel locale selected by a user.|
|<span class="notranslate">`email`</span>|<span class="notranslate">`True`</span>|Email of the account user. If there is no email, it should return null.|
|<span class="notranslate">`domain`</span>|<span class="notranslate">`True`</span>|The main domain of a user.|
|<span class="notranslate">`package`</span>|<span class="notranslate">`True`</span>|Information about the package to which a user belongs to. If the user doesn’t belong to any package, it should return null.|
|<span class="notranslate">`package.name`</span>|<span class="notranslate">`False`</span>|The name of the package to which a user belongs to.|
|<span class="notranslate">`package.owner`</span>|<span class="notranslate">`True`</span>|The owner of the package to which a user belongs to (reseller or administrator).|


#### How to provide information about domains

Specify <span class="notranslate">`DOMAINS`</span> option in the <span class="notranslate">`/etc/sysconfig/imunify360/integration.conf`</span>:

<div class="notranslate">

``` ini
[integration_sctipts]
domains = /path/to/get-domains-script.sh
```
</div>

It should point to an executable file that generates a JSON file similar to the following:

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

#### How to provide information about the control panel

Specify <span class="notranslate">`panel_info`</span> option in the <span class="notranslate">`/etc/sysconfig/imunify360/integration.conf`</span>:

<div class="notranslate">

``` ini
[integration_scripts]
panel_info = /path/to/get-panel-info-script.sh
```
</div>

It should point to an executable file that generates a JSON file similar to the following:

<div class="notranslate">

``` json
{
	"data": {
		"name": "SomeCoolWebPanel",
		"version": "1.0.1",
		"user_login_url": "https://{domain}:1111/"
	},
	"metadata": {
		"result": "ok"
	}
}
```
</div>

#### How to install Imunify360

#### Prerequisites

-   [ModSecurity 2.9.x](https://modsecurity.org/)
-   [Apache Module mod_remoteip](http://httpd.apache.org/docs/2.4/mod/mod_remoteip.html)

Now everything is ready to install Imunify360.

The installation instructions are the same as for
cPanel/Plesk/DirectAdmin version, and can be found in the
[documentation](/installation/).



#### How to configure ModSecurity integration

Configure [ModSecurity configuration
directives](https://github.com/SpiderLabs/ModSecurity/wiki/Reference-Manual-%28v2.x%29#Configuration_Directives)
(so that it can block):

<div class="notranslate">

``` apacheconf
SecAuditEngine = "RelevantOnly"
SecConnEngine = "Off"
SecRuleEngine = "On"
```
</div>

Update your your web server config: add <span class="notranslate">`IncludeOptional`</span> that points to the <span class="notranslate">`/etc/sysconfig/imunify360/generic/modsec.conf`</span> file. Create the file
if it doesn't exist, otherwise, the web server might not start until
Imunify360 is installed (which creates the file).

Set in <span class="notranslate">`integration.conf`</span>:

- <span class="notranslate">`[web_server].server_type`</span>​ – <span class="notranslate">`apache`</span>/<span class="notranslate">`litespeed`</span>
- <span class="notranslate">`[web_server].graceful_restart_script​`</span> – a script that restarts the
   web server to be called after any changes in web server config or ModSecurity rules.
- <span class="notranslate">`[web_server].modsec_audit_log`</span>​ – path to ModSecurity audit log file
- <span class="notranslate">`[web_server].modsec_audit_logdir​`</span> – path to ModSecurity audit log dir

Example:

<div class="notranslate">

``` ini
[web_server]
server_type = apache
graceful_restart_script = /path/to/a/script/that/restarts/web-server/properly
modsec_audit_log = /var/log/httpd/modsec_audit.log
modsec_audit_logdir = /var/log/modsec_audit
```
</div>

#### How to configure ModSecurity domain level integration

To enable domain-specific ModSecurity configuration, specify
<span class="notranslate">`modsec_domain_config_script`</span> in the <span class="notranslate">`integration.conf`</span>:

<div class="notranslate">

``` ini
[web_server]
modsec_domain_config_script = /path/to/inject/domain/specific/config/script.sh

```
</div>

It should point to an executable file that accepts as an input a list
of domain-specific web server settings and injects them into the
server config. The standard input (stdin) is given in the
[JSON Lines](http://jsonlines.org/) format similar to:

<div class="notranslate">

``` json
{"user": "username", "domain": "example.com", "config": "modsec config text"}
{"user": "another", "domain": "another.example.com", "config": "..."}
```
</div>

Each line contains config for a single domain e.g., it may contain
rule tags excluded for the domain.

The script should also restart the web server to apply the
configuration. This should be done so that the script could implement
the check that web server comes up after config change, and reset
configuration if it doesn't.

If configuration change failed, the script should return `1`, and in the
standard error stream (stderr) it should return the reason for
failure. On success, the script should return `0`.

In a single run of the script, we might update a single domain/user, as
well as multiple users (all users) on the system.


#### How to configure malware scanner integration

To scan files uploaded via FTP, configure
[PureFTPd](https://www.pureftpd.org/project/pure-ftpd/). Write in the <span class="notranslate">`pure-ftp.conf`</span>:

<div class="notranslate">

    CallUploadScript             yes

</div>

To scan files for changes (to detect malware) using inotify, configure
which directories to watch and which to ignore in the
<span class="notranslate">`integration.conf`</span> file:

- configure <span class="notranslate">`[malware].basedir`</span> – a root directory to watch (recursively)
- configure <span class="notranslate">`[malware].pattern_to_watch`</span> – only directories that match this
  ([Python](https://docs.python.org/3/howto/regex.html#regex-howto))
  regex in the <span class="notranslate">`basedir`</span> are actually going to be watched


Examples for already supported panels:

- cPanel

<div class="notranslate">

``` ini
basedir = /home
pattern_to_watch = ^/home/.+?/(public_html|public_ftp|private_html)(/.*)?$
```
</div>

- DirectAdmin

<div class="notranslate">

``` ini
basedir = /home
pattern_to_watch = ^/home/(.+?|.+?/domains/.+?)/(public_html|public_ftp|private_html)(/.*)?$
```
</div>

-  Plesk

<div class="notranslate">

``` ini
basedir = /var/www/vhosts/
pattern_to_watch = ^/var/www/vhosts/.+?(?<!/.skel|/chroot|/default|/system)(/.+?(?<!/logs|/bin|/chroot|/other-from-VHOST_IGNORE)(/.*)?)?$
```
</div>


#### How  to open Imunify360 UI once Imunify360 is installed


The web-based UI is available via the domain configured in <span class="notranslate">`ui_path`</span>.

For example, if
<span class="notranslate">`/var/www/vhosts/imunify360/imunify360.hosting.example.com/html/im360`</span>
is the document root folder for the <span class="notranslate">`imunify360.hosting.example.com`</span>
domain, then you could open ImunifyAV with the following URL:

* <span class="notranslate">`https://imunify360.hosting.example.com/`</span> (when you have TLS
certificate configured for the domain) or
* <span class="notranslate">`http://imunify360.hosting.example.com/`</span>


#### Extended <span class="notranslate">`integration.conf`</span> example for reference

<span class="notranslate">`integration.conf`</span> is a config in which all integration points should
be defined. It contains two kinds of fields:

* A simple variable, for example, <span class="notranslate">`[web_server].server_type`</span>
* A path to a script that will return the data for Imunify360, for example,
  <span class="notranslate">`[integration_scripts].DOMAINS`</span>.

<div class="notranslate">

``` ini
[integration_scripts]
panel_info = /opt/cpvendor/bin/panel_info
users = /opt/cpvendor/bin/users
domains = /opt/cpvendor/bin/vendor_integration_script domains
admins = /opt/cpvendor/bin/vendor_integration_script admins

[paths]
ui_path = /var/www/vhosts/im360/im360.example-hosting.com/html

[web_server]
server_type = apache
graceful_restart_script = /path/to/a/script/that/restarts/web-server/properly
modsec_audit_log = /var/log/httpd/modsec_audit.log
modsec_audit_logdir = /var/log/modsec_audit

[malware]
basedir = /home
pattern_to_watch = ^/home/.+?/(public_html|public_ftp|private_html)(/.*)?$
```

</div>

Unless otherwise stated, the expected output/error handling for the
integrations scripts follows
<https://docs.cloudlinux.com/control_panel_integration/#expected-structure-of-replies>
interface.


#### Further steps

Detailed instructions on how to use Imunify360 can be found in the [Imunify360 documentation](https://docs.imunify360.com/).


If you have any questions or experience any issues regarding the
product, submit a ticket to our technical support team. For feature
requests, just drop us an email to <feedback@imunify360.com>.

