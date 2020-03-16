# Imunify360 Features

## RapidScan

RapidScan feature allows you to increase scanning speed by lower system resource usage and gives you an opportunity to scan more frequently, further hardening your systems’ security posture.

#### RapidScan techniques

* **Faster File Integrity Checking**. File metadata, such as file hashes, are stored locally. This means that unchanged files don't need to be rescanned.
* **Efficient Cloud-assisted Scanning**. Imunify360 stores its malicious file hash database in the cloud. We detect malicious files and skip white-listed files. The remaining files are fewer, so the overall scan time is significantly reduced.
* **Optimized Malware Signatures**. Our malware signature database continually expands to match the variety of malicious software. While the database becomes more accurate and comprehensive, it also becomes larger and more cumbersome to index. We tackle this by actively curating the database and re-evaluating complex signatures, recasting any that affect scanning performance.
 
#### What does it mean to you?

When you first enable the RapidScan feature, the first scan will run as before. But subsequent scans will see a speed improvement, anywhere between 5 to 20 times faster. This is the case for both on-demand and scheduled scans, and means you can afford more scans without affecting system performance.

To take advantage of these new improvements, go to your Imunify control panel and enable RapidScan in Settings→Malware Scanner. See details [here](/dashboard/#malware).

## Low Resource Usage mode

This is a special operation mode where Imunify360 consumes less CPU and RAM. It is intended for servers with limited resources.

This mode disables <span class="notranslate">[WebShield](/webshield/)</span> switching off GrayList and Captcha. 

<span class="notranslate">_Low Resource Usage_</span> mode also enables the <span class="notranslate">_[Minimized Modsec Ruleset](/dashboard/#waf-settings)_</span> option that disables Imunify WAF rules with a high memory footprint, leaving critical rulesets enabled. 

When the <span class="notranslate">_Low Resource Usage_</span> mode is activated it is reflected on the UI: an Imunify main menu changes color to light green, and an appropriate label appears on the top right.

![](/images/LowResourceUsage.png)

## Exim+Dovecot brute-force attack protection <sup><Badge text="4.5+"/> <Badge text="Experimental" type="warn"/></sup>

:::tip Note
cPanel only, other panels will be added later
:::

Exim+Dovecot brute-force attack protection is an advanced protection against Dovecot brute-force attacks. PAM module protects against IMAP/POP3 brute-force attack and prevents mail account from being compromised via brute-forcing.

**How to enable Dovecot**

<div class="notranslate">

```
imunify360-pam enable-dovecot
```
</div>

**How to disable Dovecot**

<div class="notranslate">

```
imunify360-pam disable-dovecot
```
</div>

The options of the `pam_imunufy` are placed in the file: <span class="notranslate">`/etc/pam_imunify/i360.ini`</span>

**Values**

| | |
|-|-|
|<span class="notranslate">`USER_LOCK_TIMEOUT=5`</span>|a period of time during which a user should be blocked (minutes)|
|<span class="notranslate">`USER_LOCK_ATTEMPTS=10`</span>|a number of attempts after which a user should be blocked|
|<span class="notranslate">`USER_LOCK_MINUTES=5`</span>|a period of time (minutes) during which violation attempts from a user are counted; all attempts earlier than <span class="notranslate">`USER_LOCK_MINUTES`</span> are not counted|
|<span class="notranslate">`USER_IP_LOCK_TIMEOUT=5`</span>|a period of time during which a user + IP should be blocked (minutes)|
|<span class="notranslate">`USER_IP_LOCK_ATTEMPTS=10`</span>|a number of attempts after which a user + IP should be blocked|
|<span class="notranslate">`USER_IP_LOCK_MINUTES=5`</span>|a period of time (minutes) during which violation attempts from a user + IP are counted; all attempts earlier than <span class="notranslate">`USER_IP_LOCK_MINUTES`</span> are not counted|
|<span class="notranslate">`IP_LOCK_TIMEOUT=5`</span>|a period of time during which an IP should be blocked (minutes)|
|<span class="notranslate">`IP_LOCK_ATTEMPTS=10`</span>|a number of attempts after which an IP should be blocked|
|<span class="notranslate">`IP_LOCK_MINUTES=5`</span>|a period of time during which violation attempts from an IP are counted; all attempts earlier than <span class="notranslate">`IP_LOCK_MINUTES`</span> are not counted|

**How to apply settings**

In order to apply new settings in the <span class="notranslate">`/etc/pam_imunify/i360.ini`</span>, run the following command:

<div class="notranslate">

```
systemctl restart imunify360-pam
```
</div>

#### How it works

During the last <span class="notranslate">`XXX_LOCK_MINUTES`</span> we count the number of login failures (unsuccessful login attempts). If the number of attempts exceeds the specified threshold <span class="notranslate">`XXX_LOCK_ATTEMPTS`</span>, the PAM plugin blocks access for <span class="notranslate">`XXX_LOCK_TIMEOUT`</span> minutes. After that, the counter is reset and the process repeats. 
Note that the plugin has three separate counters and a set of settings for USER/IP/USER+IP management regarding brute-force attacks (see the table above).


:::tip Notes
* If a user is blocked by <span class="notranslate">`USER_LOCK_ATTEMPTS`</span>, then this user will not have access to the server from any IP
* If a user is blocked by <span class="notranslate">`USER_IP_LOCK_ATTEMPTS`</span>, then this user will not have access to the server from that specific IP
* If an IP is blocked by <span class="notranslate">`IP_LOCK_ATTEMPTS`</span>, then all users will not have access to the server from that specific blocked IP
:::


## SMTP Traffic Manager <sup><Badge text="4.6+"/> <Badge text="Experimental" type="warn"/></sup>

SMTP traffic management provides more control over SMTP traffic.

An administrator can redirect mail traffic to the local MTA, block it completely, or keep it available for local mails only. Administrators can also block particular ports and whitelist specific users or groups for outgoing mail.

This feature extends the existing cPanel <span class="notranslate">“Block SMTP”</span> functionality, albeit with more control and capabilities, and replaces the similar functionality from CSF. 

You can enable the <span class="notranslate">SMTP Traffic Management</span> in the <span class="notranslate">Settings</span>:

![](/images/SMTPSettings.png)

* <span class="notranslate">**SMTP ports**</span> - a list of the ports to be blocked. The defaults are: 25, 587,465
* <span class="notranslate">**Allow users**</span> a list of the users to be ignored (not blocked). By default it is empty. Including Unix and CPanel users (if a process that sends an email has a UID of one of the <span class="notranslate">`allow_users`</span>, it will not be blocked)
* <span class="notranslate">**Allow groups**</span> - a list of the groups to be ignored (not blocked). By default it is empty. Including Unix and CPanel users (if a process that sends an email has a UID of one of the <span class="notranslate">`allow_users`</span>, it will not be blocked)
* <span class="notranslate">**Allow local**</span> - block all except the local SMTP (localhost). By default it is disabled.
* <span class="notranslate">**Redirect to local**</span> - enable automatic redirection to the local ports for outgoing mail traffic. By default it is disabled.

To enable these settings via direct config file update or a command-line interface, use this command: 

<div class="notranslate">

```
/etc/sysconfig/imunify360/imunify360.config
```
</div>

The config file should show:

<div class="notranslate">

```
SMTP_BLOCKING:
 allow_groups:
 - mailacc
 allow_local: true
 allow_users: []
 enable: true
 ports:
 - 25
 - 587
 - 465
 redirect: true
```
</div>

#### Troubleshooting and FAQ

#### If the Conflict with WHM >> SMTP Restrictions message is shown?

![](/images/SMTPFAQ.png)

<span class="notranslate">_WHM SMTP Restrictions_</span> requires to be disabled at the cPanel to get <span class="notranslate">_SMTP Traffic Management_</span> working.

To disable it, log in to the cPanel WHM portal, select <span class="notranslate">_SMTP Restrictions_</span> on the left sidebar and disable it.


