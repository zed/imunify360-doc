# FAQ and Known Issues


## Common Questions

### 1. End user IP is blocked and I do not know why

If you use CSF, then try to find the IP in [CSF](/ids_integration/#csf-integration) <span class="notranslate">Allow/Deny</span> Lists using their [documentation and support](https://support.configserver.com/knowledgebase/category/support%20). If not, then do the following:

* Go to cPanel Plugins section, choose Imunify360 and enter the <span class="notranslate">Incidents</span> page.

* Make sure that the IP checkbox at the top of the table is ticked. Enter proper IP or part of IP in the input field and click _Enter_.

  * If the IP was found, then follow instructions on [Incidents page](/dashboard/#incidents) and perform the actions you need, like: add IP to the <span class="notranslate">White List</span> or disable the security rule that has detected this incident.

* If the IP was not found on the Incidents page, then go to Firewall page and using the same way as in the previous step try to find proper IP in <span class="notranslate">Black List</span> or <span class="notranslate">Grey List</span>.

  * If the IP was found then follow this instruction for <span class="notranslate">[Grey List](/dashboard/#firewall)</span> or <span class="notranslate">[Black List](/dashboard/#firewall)</span> and move the IP to the <span class="notranslate">White List</span> or just remove from the <span class="notranslate">Black List</span> or <span class="notranslate">Grey List</span>.

If nothing helps, then [contact our support team](https://cloudlinux.zendesk.com/hc/requests/new).

:::tip Note
There is a corner case of [IP whitelisting/port blocking precedence](/faq_and_known_issues/#ip-whitelisting-port-blocking-precedence)
:::

### 2. Could I disable IPtables (firewall) or OSSEC, when using Imunify360?

No. Imunify360 will not be able to stop an attack without IPtables and will not be able to detect an attack without OSSEC.

### 3. Does Imunify360 log events such as adding or removing an IP to/from the Gray List?

Most Imunify360 logs are saved in <span class="notranslate">`/var/log/imunify360/console.log`</span>. For example, when IP is blocked and added to the <span class="notranslate">Black List</span>, the following lines are added:

<div class="notranslate">

``` Python
INFO [2017-04-15 18:30:00,889]
defence360agent.plugins.protector.lazy_init: IP 103.86.52.175 is BLOCKED
with 300 sec (expiration: 1492281300) (due to SensorAlert)
INFO [2017-04-15 18:30:00,889]
defence360agent.plugins.protector.lazy_init: Unblocking 103.86.52.175 in
CSF as it is already in our graylist
INFO [2017-04-15 18:30:01,663] defence360agent.internals.the_sink:
SensorAlert:
{'rule_id': 'LF_SMTPAUTH', 'timestamp': 1492281000.8720655, 'attackers_ip': '103.86.52.175', 'plugin_id': 'lfd', 'method': 'ALERT', 'ttl': '1'}
When user unblocks himself by captcha, logs look like this:
INFO [2017-04-17 00:51:26,956] defence360agent.internals.the_sink:
CaptchaEvent:
{'timestamp': 1492404686.9496775, 'errors': [], 'user_agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36', 'accept_language': 'ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4', 'event': 'PASSED', 'method': 'CAPTCHA', 'attackers_ip': '10.101.1.18'}
INFO [2017-04-17 00:51:26,967]
defence360agent.plugins.protector.lazy_init: IP 10.101.1.18 is UNBLOCKED
(due to ClientUnblock)
```

</div>

Adding and removing IPs from the <span class="notranslate">White List</span> is only possible manually, no IPs will be added automatically.

### 5. To start using Imunify360 we need to know which information is sent to your servers. Could you please give us some more information?

The following info is sent to our server:

* all the messages from IDS OSSEC (can be found in OSSEC logs)
* all the messages from <span class="notranslate">mod_security</span> (can be found in <span class="notranslate">`modsec_audit.log`</span>)
* users domains (to be checked in reputation engine);
* CAPTCHA verification info
* all running scans for malware (maldet scans) and information on moving to the quarantine or discovering suspicious files
* optionally, suspicious files can be sent to us for the analysis. Files can be sent via UI by marking a proper checkbox

### 6. No valid Imunify360 License Found.

Check if the agent is running.

Check access to the central server (<span class="notranslate">`IP: 148.251.130.176 port: 443)`</span>.

Call <span class="notranslate">`imunify360-agent rstatus`</span> and ensure that status is <span class="notranslate">`True`</span>:

<div class="notranslate">

```
{'expiration': 0, 'status': True, 'user_count': None, 'user_limit': None, 'redirect_url': None}
```

</div>

Ensure that <span class="notranslate">`/etc/sysconfig/imunify360/imunify360.id`</span> file contains <span class="notranslate">`server_id`</span>.

If no, <span class="notranslate">`imunify360-agent register KEY`</span>.

### 7. I have an error peewee.DatabaseError: database disk image is malformed. What should I do?

Imunify360 uses SQLite database to store its data. Although this database has proved its reliability, database files become corrupted in rare cases. To restore data try to perform the following steps:

Stop the agent.

If you have sqlite3 application installed on your machine, try to make dump of Imunify360 database:

<div class="notranslate">

```
#sqlite3 /var/imunify360/imunify360.db
.mode insert
.output dump_all.sql
.dump
.exit
```

</div>

You should see new file <span class="notranslate">`dump_all.sql`</span> in the directory <span class="notranslate">`/var/imunify/`</span>

Create a new database from this dump file:

<div class="notranslate">

```
#sqlite3 imunify360.db.new < dump_all.sql
```

</div>

Replace old database with the new one:

<div class="notranslate">

```
#cd /var/imunify/
#mv imunify360.db imunify360.db.corrupt && mv imunify360.db.new imunify360.db
```

</div>

Start the Imunify360 agent.

If these steps have not solved the problem or no sqlite3 package is installed, then you should create a completely new database:

Stop the agent.

<div class="notranslate">

```
#rm /var/imunify/imunify360.db
#imunify360-agent migratedb
```

</div>

Start the agent

### 8. Why does my cPanel with LiteSpeed and OWASP ModSecurity rule set trigger 500 error on all web pages after installing Imunify360?

OWASP rule set may conflict with Imunify360 default rule set on a server running <span class="notranslate">LiteSpeed Web Server</span>. We recommend to turn off OWASP rule set prior to installing Imunify360.

Please find more FAQs in our [Knowledge Base](https://cloudlinux.zendesk.com/hc/sections/360003635400-FAQ).

### 9. Disabling WAF rules for certain countries.

It is possible to disable some WAF rules for IPs that are resolved to be from some country (or other geographical entity).
To implement this, a customer should create his own modsecurity configuration file, and include it into the default modsecurity configuration. In case of cPanel, this can be done by creating <span class="notranslate">`/etc/apache2/conf.d/includes/countrywafrules.conf`</span> and adding it as an include to the <span class="notranslate">`/etc/apache2/conf.d/modsec/modsec2.cpanel.conf`</span>. Otherwise configuration files might be rewritten by Imunify360 rules update.

Example of contents of such config file:

<div class="notranslate">

```
SecGeoLookupDb /path/to/GeoLiteCity.dat 
# ModSecurity relies on the free geolocation databases (GeoLite City and GeoLite Country) that can be obtained from MaxMind http://www.maxmind.com. Currently ModSecurity only supports the legacy GeoIP format. Maxmind's newer GeoIP2 format is not yet currently supported.
So a customer need to download this IP database and locate somewhere.

# Lookup IP address 
SecRule REMOTE_ADDR "@geoLookup" "phase:1,id:155,nolog,pass"

# Optionally block IP address for which geolocation failed
# SecRule &GEO "@eq 0" "phase:1,id:156,deny,msg:'Failed to lookup IP'"

# Skip rules 942100 and 942101 for GB country as example

SecRule GEO:COUNTRY_CODE "@streq GB" "phase:2,auditlog,id:157,pass,severity:2,\
ctl:ruleRemoveById=942100,\
ctl:ruleRemoveById=942101"
```
</div>

Make sure that you have replaced <span class="notranslate">`/path/to/GeoLiteCity.dat`</span> with the real path to the GeoLiteCity.dat file installed in your system.

Variable <span class="notranslate">`GEO`</span> is a collection populated by result of the last <span class="notranslate">`@geoLookup`</span> operator. The collection can be used to match geographical fields looked from an IP address or hostname.

:::tip Note
Available since ModSecurity 2.5.0.
:::

Fields:

* <span class="notranslate">`COUNTRY_CODE`</span>: two character country code. Example: `US`, `GB`, etc.  
* <span class="notranslate">`COUNTRY_CODE3`</span>: up to three character country code.  
* <span class="notranslate">`COUNTRY_NAME`</span>: full country name.  
* <span class="notranslate">`COUNTRY_CONTINENT`</span>: two character continent that the country is located. Example: `EU`. 
* <span class="notranslate">`REGION`</span>: two character region. For US, this is state. For Canada, providence, etc.  
* <span class="notranslate">`CITY`</span>: city name if supported by the database.  
* <span class="notranslate">`POSTAL_CODE`</span>: postal code if supported by the database.  
* <span class="notranslate">`LATITUDE`</span>: latitude if supported by the database.  
* <span class="notranslate">`LONGITUDE`</span>: longitude if supported by the database.  
* <span class="notranslate">`DMA_CODE`</span>: metropolitan area code if supported by the database. (US only)  
* <span class="notranslate">`AREA_CODE`</span>: phone system area code. (US only)  

### 10. How to clone Imnify360 configuration on another system?

The solution is available in [FAQ section](https://cloudlinux.zendesk.com/hc/en-us/articles/360022689394-How-to-Clone-Imunify360-Installation)

### 11. How to disable Support icon in the Imunify360 UI?

1. Go to <span class="notranslate">`/etc/sysconfig/imunify360/imunify360.config`</span>.
2. And set <span class="notranslate">`PERMISSIONS.support_form:`</span> option to <span class="notranslate">`false`</span>.

OR, **better**, run the following command:

```
imunify360-agent config update '{"PERMISSIONS": {"support_form": false}}'
```

### 12. How to hide the Ignore List tab for end users in the Imunify360 UI?

1. Go to <span class="notranslate">`/etc/sysconfig/imunify360/imunify360.config`</span>.
2. And set <span class="notranslate">`PERMISSIONS.user_ignore_list:`</span> option to <span class="notranslate">`false`</span>.

OR, **better**, run the following command:

```
imunify360-agent config update '{"PERMISSIONS": {"user_ignore_list": false}}'
```

### 13. How to delete malware scan results from Imunify360’s database?

Sometimes, you may need to delete all users’ scan results from the server. This should not be common practice, and we do not recommend doing it on a regular basis. But, if you do need to erase the results of all Imunify360 scans, you can find the instructions below.

1. First, you need to stop the agent:

<div class="notranslate">

```
systemctl stop imunify360
```
</div>

(on CentOS 7)
<div class="notranslate">

```
service imunify360 stop
```
</div>

(on CentOS 6, Ubuntu)

2. Connect to the Imunify360 database by running this command:

<div class="notranslate">

```
sqlite3 /var/imunify360/imunify360.db
```
</div>

3. Execute the following SQL commands:

:::danger IMPORTANT
This will remove all scan results from Imunify360!
:::

<div class="notranslate">

```
DELETE FROM malware_history;
DELETE FROM malware_hits;
DELETE FROM malware_scans;
DELETE FROM malware_user_infected;
```
</div>

4. Start the Imunify360 service:

<div class="notranslate">

```
systemctl start imunify360
```
</div>

(on CentOS 7)
<div class="notranslate">

```
service imunify360 start
```
</div>

(on CentOS 6, Ubuntu)

We don’t recommend cleaning the scan results for specific users, as it may cause inconsistencies in the <span class="notranslate"> `malware_scans` </span> table. But, in emergencies, you can do it with these SQL commands:

<div class="notranslate">

```
DELETE FROM malware_history WHERE file_onwer = <user>;
DELETE FROM malware_hits WHERE user = <user>;
DELETE FROM malware_user_infected WHERE user = <user>;
```
</div>

Unfortunately, there’s no easy way to delete records in the <span class="notranslate"> `malware_scans` </span> table for a specific user, so the table should be either truncated with the other tables shown in step 2 above, or the records should just be ignored.

If you need any more information on this or anything else related to Imunify360 administration, please [get in touch](mailto:feedback@imunify360.com) .

### 14. Imunify360 WebShield ‘Could not allocate memory’ problem. How to fix?

**Symptoms:** It can have pretty different symptoms (increased IO, CPU and memory usage), but the main one is that WebShield blacklisting (through CDN) does not work.

**How to check:** Just browse wsshdict log (<span class="notranslate">`/var/log/wsshdict/wsshdict.log`</span>). If you face the issue, the log will have entries like:

<div class="notranslate">

```
2019-07-09 16:50:06 [WARN]: Could not allocate memory for 192.126.123.115/32 in rbtree
2019-07-09 16:52:23 [WARN]: Could not allocate memory for 179.108.244.125/32 in lpctrie
```

</div>

This means that the shared memory is full and no new address is allowed to be added.
Shared memory has a fixed size (it’s set in configuration files) and cannot change it dynamically. Currently, the size of shared memory is **20 MB**, and it can take up to 89k IPv4 addresses. However, some of our clients have more blacklisted addresses, and when Imunify360 agent tries to place all these IP addresses into shared memory, the aforementioned error occurs.

**How to fix:** We want to increase the shared memory size.

1. Modify the second parameter of the <span class="notranslate">`shared_storage`</span> directive of the <span class="notranslate">`/etc/imunify360-webshield/webshield.conf`</span> config file, to make it look like:

<div class="notranslate">

```
shared_storage /opt/imunify360-webshield/shared_data/shdict.dat 21m;
```

</div>

2. Modify the <span class="notranslate">`data_size`</span> directive of the <span class="notranslate">`/etc/imunify360-webshield/webshield-shdict.conf`</span> config file to `22020096` (21 MB in bytes: 1024 * 1024 * 21):

3. Restart <span class="notranslate">`imunify360-webshield`</span>:

<div class="notranslate">

```
   systemctl restart imunify360-webshield
```
</div>

Or

<div class="notranslate">
 
```
   service imunify360-webshield reload
```
 
 </div>
 
 The wsshdict daemon is expected to be restarted automatically.
 
4. Make sure the shared memory size is actually changed. Run <span class="notranslate">`ipcs -m`</span> command. It’s expected to have the output like this:

<div class="notranslate">
 
``` 
# ipcs -m
------ Shared Memory Segments --------
key      shmid   owner    perms   bytes nattch status  
0x620035c1 4554752  imunify360 600    22020096   4                       
0x00000000 32769    root       644    80         2
``` 
 
</div>

The first column must not have zeros (like in the second row), the third column (owner) is expected to be ‘imunify360-webshield’, and size must correspond to values set in the config files (22020096 in our case).


### 15. How to check "ModSecurity scan" works?

1. To verify, if ModSecurity scan works, you can use the following command:

<div class="notranslate">

```
curl -v -s -o /dev/null -F 'data=@<path-to-malware-sample>' http://<domain>/
```

</div>

You can get a malware sample file on the eicar.org: [eicar.org](http://www.eicar.org/).

For instance:

<div class="notranslate">

```
wget http://www.eicar.org/download/eicar.com.txt -O /tmp/eicar.com.txt
curl -v -s -o /dev/null -F 'data=@/tmp/eicar.com.txt' http://mycoolwebsite.net/
```
</div>

You can find the results of this attempt in the <span class="notranslate">_Incidents_</span> tab 

1. Also, you can perform the following request which triggers a test rule

<div class="notranslate">

```
curl -v http://mycoolwebsite.net//?i360test=88ff0adf94a190b9d1311c8b50fe2891c85af732 
```
</div>

And check the Imunify360 console log

<div class="notranslate">

```
grep 'Testing the work of the i360 ModSecurity rules' /var/log/imunify360/console.log
```
</div>

### 16. How to check "automatically scan all modified files" works?

To check "automatically scan all modified files" (i.e inotify scanner), upload a malware sample to some account's webroot via SSH and check if it will appear in the <span class="notranslate">_Malicious_</span> tab shortly.

You can get a malware sample file on the [eicar.org](http://www.eicar.org/).

Make sure [the option is enabled](/dashboard/#malware).

<div class="notranslate">

```
wget http://www.eicar.org/download/eicar.com.txt -O /tmp/eicar.com.txt
scp /tmp/eicar.com.txt  mycooluser@X.Y.Z.A:/var/www/mycooluser/mycoolwebsite_docroot
```

</div>

where <span class="notranslate">`X.Y.Z.A`</span> - your server IP address

You can find the results in the <span class="notranslate">_Malware scanner > Files_</span> tab.

### 17. Malware file reasons

Starting from Imunify version 4.6 you can see the advanced reason why a file was detected as malicious.

Go to <span class="notranslate">Imunify → Malware Scanner → Files tab → Reason</span>. See [Malware Scanner → Files tab](/dashboard/#files).

A reason pattern looks like the following:

<div class="notranslate">

```
<type>-<detected>-<ID>-<file-type>.<mlwcategory>.<mlwclassification>
```
</div>

| | |
|-|-|
|<span class="notranslate">`<type>`</span>|`SMW` – server malware, `CMW` – client malware|
|<span class="notranslate">`<detected>`</span>|`SA`- stand-alone (file is completely malicious), `INJ` – injections (malware is injected to some legitimate file), `BLKH` – blackhash|
|<span class="notranslate">`<ID>`</span>|a signature ID|
|<span class="notranslate">`<file-type>`</span>|a file type; see [Table 1](/faq_and_known_issues/#table-1-file-types-and-their-codes) below|
|<span class="notranslate">`<mlwcategory>`</span>|a malware category, see [Table 2](/faq_and_known_issues/#table-2-malware-categories) below|
|<span class="notranslate">`<mlwclassification>`</span>|malware classification; can vary depends on the different cases and signatures; see [Table 3](/faq_and_known_issues/#table-3-malware-classification) below|

#### Table 1. File types and their codes

| | |
|-|-|
|**File types**|**Codes**|
|Markup language files|`htm`, `html`, `shtml` ,`phtml`|
|Server config files|`htaccess`|
|<span class="notranslate">JavaScript</span> files|`js`|
|<span class="notranslate">Perl</span> files|`pl`|
|<span class="notranslate">Python</span> files|`py`|
|<span class="notranslate">Ruby</span> files|`rb`|
|<span class="notranslate">Cron</span> files|`cron`|
|<span class="notranslate">Shell</span> scripts|shells in common: `sh`|
|Other server pages|`Jsp` (`asp`,`aspx`), `vb`|


#### Table 2. Malware categories

| | |
|-|-|
|**Category**|**Explanation**|
|<span class="notranslate">`bkdr`</span>|Artifacts that help attackers with partial or complete access to victims. Example: web shells|
|<span class="notranslate">`tool`</span>|Scripts that are uploaded to victim's servers and can be used to perform certain specific actions like file upload, database access, downloaders/droppers, mailers, brute-force scripts, proxy scripts, etc.|
|<span class="notranslate">`exploit`</span>|Scripts that are uploaded to victim's servers and meant to exploit certain other vulnerabilities or bugs. Example: WordPress/Joomla exploits|
|<span class="notranslate">`spam`</span>|Files that deliver spam or point end-users towards spammy content. Example: doorway pages, other SEO spam, spam advertisement, injections, etc.|
|<span class="notranslate">`phish`</span>|Phishing related malware artifacts|
|<span class="notranslate">`miner`</span>|All sorts of miners go under this category|
|<span class="notranslate">`redi`</span>|Malware artifacts causing redirects for any sort of malicious reason can be covered under this category|
|<span class="notranslate">`deface`</span>|Any sort of artifacts that are meant to show off attacker's intentions or to spread a certain message. Example: Defacements, banners, etc.|


#### Table 3. Malware classification

The <span class="notranslate">_Malware classification_</span> field is not fixed and may vary depending on the purposes of the malware.

The following table shows the <span class="notranslate">_Malware classification_</span> field examples.

| | |
|-|-|
|**Category**|**Classification**|
|<span class="notranslate">`bkdr`</span>|<span class="notranslate">`wshll`</span> for web shells; <span class="notranslate">`exec`</span> for simple command executor injections|
|<span class="notranslate">`tool`</span>|<span class="notranslate">`upldr`/`dwnldr`/`drpr`</span> for uploader/downloader/dropper type of files|
|<span class="notranslate">`exploit`</span>|<span class="notranslate">`vuln`/`joom`/`wp`</span> for vulnerability/Joomla/WordPress|
|<span class="notranslate">`phish`</span>|<span class="notranslate">`ecom`/`bank`/`edu`</span> for mentioning phishing on e-commerce/banking/educational domains|
|<span class="notranslate">`miner`</span>|<span class="notranslate">`chive`/`cimp`/`cloot`</span> for Coinhive/CoinIMP/CryptoLoot|



#### Example

| | |
|-|-|
|**Reason**|**Explanation**|
|<span class="notranslate">`SMW-SA-05155-sh.bkdr.wshll`</span>|**type**: server malware (`SMW`)<br>**detected**: stand-alone (file is completely malicious) (`SA`)<br>**signature ID**: `05155`<br>**file type**: shell scripts (`sh`)<br>**mlwcategory**: artifacts that help attackers with partial or complete access to victims (`bkdr`)<br>**mlwclassification**: web shells (`wshll`)|


### 18. Can Imunify360 firewall block traffic by domain name?

Unfortunately, Imunify360 does not have such ability. 

### 19. What ports are used by WebShield?  
 
The following ports are reserved:

* 52223
* 52224
* 52227-52235

You can find additional information in the following config files:

<div class="notranslate">

```
/etc/imunify360-webshield/ports.conf
/etc/imunify360-webshield/ssl_ports.conf
/etc/imunify360-webshield/webshield.conf
```

</div>

### 20. Where can I find the quarantined files?

You can find the quarantined files in the following directory: <span class="notranslate">`/home/.imunify.quarantined/USERNAME`</span>


### 21. How to check that CAPTCHA works?

First, remove an IP from the White list:

<div class="notranslate">

```
# imunify360-agent whitelist ip delete YOUR_IP 
```

</div>

After that, run the following loop which triggers ModSecurity test rule 5 times in a row that leads to graylisting of the IP due to the sequence of 403 HTTP errors:

<div class="notranslate">

```
# for i in {1..5} ; do curl -s http://SERVER_IP/?i360test=88ff0adf94a190b9d1311c8b50fe2891c85af732 > /dev/null; echo $i; done
```
</div>

Where <span class="notranslate">`SERVER_IP`</span> is the server's IP address where Imunify360 is installed and where you want to check CAPTCHA.

Also, it is possible to use a domain name of a website which `DNS A` record is pointed to the server. In other words, which is located on the server, like: 

<div class="notranslate">

```

# for i in {1..5} ; do curl -s http://your.cooldomain.net/?i360test=88ff0adf94a190b9d1311c8b50fe2891c85af732 > /dev/null; echo $i; done
```
</div>


### 22. How to edit watched and excluded patterns for Malware Scanner? <Badge text="v.4.8" />

Starting from Imunify version 4.8 you can edit watched and excluded patterns for Malware Scanner.

There are two files:
* <span class="notranslate">`/etc/sysconfig/imunify360/malware-filters-admin-conf/watched.txt`</span> defines which paths are watched by Imunify360
* <span class="notranslate">`/etc/sysconfig/imunify360/malware-filters-admin-conf/ignored.txt`</span> defines which paths are excluded by Imunify360

:::tip Note
This exclude list is intended for things like logs, tmp files, etc. Things that are not worth scanning in real-time and should not be allowed to execute.
Proactive Defense will prevent <span class="notranslate">`include`/`require`</span> of PHP files that are excluded by realtime-scan.
There is a separate ignore list for false-positive hits: see [Ignore List](/dashboard/#ignore-list)
:::

The `watched.txt` file contains additional shell-like glob patterns specifying what file system directories should be monitored by inotify/fanotify realtime scanner.

Patterns can be absolute:

<div class="notranslate">

```
/another/folder
```
</div>

or relative to basedirs supplied by hosting control panels, if they start with a "+" sign:"

<div class="notranslate">

```
+*/www
```
</div>

This relative pattern will expand to the `/home/*/www` for cPanel, for example.

All patterns listed here have higher priority than stock watched and excluded lists supplied with Imunify360.

:::warning IMPORTANT
After making changes to this file, run the `imunify360-agent malware rebuild patterns` command.
:::

The <span class="notranslate">`ignored.txt`</span> file contains additional regular expression patterns specifying what filesystem paths should not be monitored by inotify/fanotify realtime scanner.

Patterns can be absolute:

<div class="notranslate">

```
/another/folder
```
</div>

or relative to basedirs supplied by hosting control panels, if they start with a "+" sign:"

<div class="notranslate">

```
+[^/]+/www/\.cache
```
</div>

This relative pattern may expand to the <span class="notranslate">`^/home/[^/]+/www/\.cache`</span> for cPanel, for example. The `+` sign at the beginning is substituted with all base directories for user homes. Imunify360 picks up those directories from hosting panel configuration.

All patterns listed here have higher priority than stock watched and excluded lists supplied with Imunify360.

Custom exclude patterns have higher priority than custom watched patterns.

:::warning IMPORTANT
After making changes to this file, perform the <span class="notranslate">`imunify360-agent malware rebuild patterns`</span> command.
:::   

### 23. How to test rules based on ModSecurity tags?

You can use the following URIs to check what was activated.

<div class="notranslate">

```
curl -k 'https://example.org/?tag_test=joomla_core'
```
</div>

It will produce 403 only for sites with Joomla!.

<div class="notranslate">

```
curl -k 'https://example.org/?tag_test=wp_core'
```
</div>

It will produce 403 only for sites with WordPress.


### 24. "Imunify agent is not running" troubleshooting

Having the Imunify service installed, you may come across the situation when the message <span class="notranslate">"Imunify agent is not running"</span> is displayed when you try to access the Dashboard:

![](/images/ImunifyAgentNotRunning.png)

First of all, try to check the status of the service via the command line using the following command:

<div class="notranslate">

```
# service imunify360 status
```
</div>

In case you see the agent is inactive:

<div class="notranslate">

```
[root@host ~]# service imunify360 status


Redirecting to /bin/systemctl status imunify360.service
● imunify360.service - Imunify360 agent
Loaded: loaded (/usr/lib/systemd/system/imunify360.service; disabled; vendor preset: disabled)
Active: inactive (dead)
```
</div>

try to start it via the following command:

<div class="notranslate">

```
# service imunify360 start
```
</div>

It may also occur that despite the Imunify’s Dashboard showing the <span class="notranslate">"agent is not running"</span>, the service itself is loaded and active.

You can check it with the following command:

<div class="notranslate">

```
# service imunify360 status -l
```
</div>

Example output:

<div class="notranslate">

```
[root@host ~]# service imunify360 status -l

Redirecting to /bin/systemctl status -l imunify360.service
● imunify360.service - Imunify360 agent
Loaded: loaded (/usr/lib/systemd/system/imunify360.service; enabled; vendor preset: disabled)
Active: active (running) since Mon 2020-05-13 02:58:43 WIB; 3min 54s ago
Main PID: 1234567 (python3)
Status: "Demonized"
CGroup: /system.slice/imunify360.service
├─1234567 /opt/alt/python35/bin/python3 -m im360.run --daemon --pidfile /var/run/imunify360.pid
├─1234568 /usr/bin/tail --follow=name -n0 --retry /usr/local/cpanel/logs/cphulkd.log
├─1234569 /usr/bin/tail --follow=name -n0 --retry /etc/apache2/logs/modsec_audit.log
├─1234570 /usr/bin/tail --follow=name -n0 --retry /var/ossec/logs/alerts/alerts.json
└─1234571 /opt/alt/python27/bin/python2.7 -s /usr/sbin/cagefsctl --wait-lock --force-update-etc
May 13 02:58:39 host.domain.com systemd[1]: Starting Imunify360 agent…
May 13 02:58:43 host.domain.com systemd[1]: Started Imunify360 agent.
May 13 02:58:43 host.domain.com imunify-service[4072717]: Starting migrations
May 13 02:58:43 host.domain.com imunify-service[4072717]: There is nothing to migrate
```
</div>

Most often, such circumstances attest that the Imunify service has been recently installed on the server. Sometimes, a desynchronization between the agent and the web interface may occur in such cases, and it can take a bit of time for the database to be integrated completely.

In case the issue is still the same after 60 minutes, you can try creating the backup of the Imunify files and do the service restart to force the sync process:

<div class="notranslate">

```
# service imunify360 stop
# mv /var/imunify360/files /var/imunify360/files_backup
# service imunify360 start
```
</div>

After these actions, wait until the files downloading and the migration process are complete – the agent will synchronize with the web interface and start working normally. You can monitor this process via

<div class="notranslate">

```
# tail -f /var/log/imunify360/console.log.
```
</div>

Another similar workaround may be handy in case you locate some database-related error inside the <span class="notranslate">`/var/log/imunify360/error.log`</span> – by renaming the database file and restarting the service. There may be errors like

<div class="notranslate">

```
"Imunify360 database is corrupt. Application cannot run with corrupt database."
```
</div>

or some lines with

<div class="notranslate">

```
"sqlite3.DatabaseError".
```
</div>

The `imunify360.db` file is an sqlite3 database the Imunify360 relies on; it contains incidents, malware hits/lists, settings, etc. Using this workaround will force the database recreation:

<div class="notranslate">

```
# service imunify360 stop
# mv /var/imunify360/imunify360.db /var/imunify360/imunify360.db_backup
# service imunify360 start
```
</div>

If you face any difficulties during the progress or simply cannot make the agent start, please run

<div class="notranslate">

```
# imunify360-agent doctor
```
</div>

and provide the output to our Support Team at [https://cloudlinux.zendesk.com/hc/requests/new](https://cloudlinux.zendesk.com/hc/requests/new).

You can find the ImunifyAV(+) instructions [here](https://docs.imunifyav.com/faq_and_known_issues/#imunify-agent-is-not-running-troubleshooting).


## Corner cases

#### IP whitelisting/port blocking precedence

Imunify360 has a corner case related to the following behavior of the Imunify360 firewall: when some IP is whitelisted and at the same time a certain port is blocked, the access to the port for the whitelisted IP is blocked (the port setting takes precedence).

![](/images/corner1.jpg)
![](/images/corner2.jpg)

As a workaround, you may add the IP address to "Whitelisted IP" list for the blocked port:

![](/images/corner3.jpg)

If you wish to use CLI -  you may remove the blocked port for all IPs and add a new record with the list of whitelisted IPs. Here's an example for TCP port 2083:

<div class="notranslate">

```
imunify360-agent blocked-port delete 2083:tcp
imunify360-agent blocked-port add  2083:tcp --ips 69.175.3.6  10.102.1.37
```
</div>

## Plesk related

### How to get an Imunify activation key from the extended Plesk license

Often our clients purchase Imunify licenses through Plesk/Odin and in such cases, they get a universal key which includes the Imunify license and other additional keys for Plesk plugins. Such a key has the following syntax – `A00B00-0CDE00-F0G000-HIGK00-LM0N00`, – and initially, it is installed through Plesk automatically and the license gets activated successfully.

However, if it is required to re-register the agent for some reason or simply get the Imunify activation key separately, it would be impossible to apply the above-mentioned one – we would need to deal with the Imunify service separately. 

To get the Imunify360 activation key from the extended Plesk license key, you will need to proceed with the following.

1. Navigate to <span class="notranslate">_Tools & Settings >> Plesk >> License Management >> Additional License Keys_</span>

  ![](/images/LicenseManagement.png)

  ![](/images/AdditionalLicenseKeys.png)

2. Click <span class="notranslate">_Download key_</span> next to the Imunify license listed on the page and open the file downloaded in some text editor

3. Find the following abstract:

  <div class="notranslate">

  ```
  <!--Key body-->
  <aps-3:key-body core:encoding="base64" core:type="binary">YOUR_BASE64_ENCODED_LICENSE_KEY==</aps-3:key-body>
  <!--Information about additional key-->
  ```
  </div>

4. This is your base64-encoded key, and it should be decoded using a CLI utility or an online base64 decoder into UTF-8, e.g. [https://www.base64decode.org](https://www.base64decode.org). 
The new license key should have the following format: `IMxxxxxxxxxxxxxxx`.

5. Use the new key decoded to activate the service:

  <div class="notranslate">

  ```
  # imunify360-agent register DECODED_KEY_HERE
  ```
  </div>

This is it!


<Disqus/>

