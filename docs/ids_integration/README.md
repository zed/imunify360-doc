# IDS Integrations

## CSF Integration


<span class="notranslate">[ConfigServer Security & Firewall (CSF)](https://www.configserver.com/cp/csf.html)</span> integration is intended to allow to use <span class="notranslate">CSF</span> along with Imunify360.

Imunify360 automatically detects that CSF is running (you can enable it anytime). Imunify360 [Blocked Ports](/dashboard/#blocked-ports), [DoS Protection](/dashboard/#dos-protection) and [SMTP Traffic Manager](/dashboard/#smtp-traffic-manager) features are automatically disabled in this case.

To check that running <span class="notranslate">CSF</span> is detected, go to <span class="notranslate">Imunify360 → Firewall tab → White List</span> section and check if there is a warning message <span class="notranslate">"_CSF is enabled. Please manage IPs whitelisted in CSF using CSF user interface or config file_"</span>. 

![](/images/firewallblacklistwarning_zoom70.png)

#### 3-rd Party Integration mode

The main setting that defines how Imunify360 works along with CSF is [3-rd Party Integration](https://docs.imunify360.com/dashboard/#_3-rd-party-integration) switch. (The [config file](/config_file_description/) equivalent is `CSF_INTEGRATION.catch_lfd_events`). If this mode is **disabled** (default), CSF and Imunify360 work as two independent solutions (with redundant modules disabled on the Imunify360 side - see above).

When 3-rd Party Integration mode is **enabled** Imunify360 uses <span class="notranslate">Login Failure Daemon (LFD)</span> as source for security events instead of <span class="notranslate">[OSSEC](https://www.ossec.net)</span>. To get events from <span class="notranslate">Login Failure Daemon (LFD)</span>, Imunify360 automatically replaces <span class="notranslate">`BLOCK_REPORT`</span> variable to the file path of Imunify360 script.
When some IP address is blocked by <span class="notranslate">LFD, Imunify360</span> adds this IP address to its <span class="notranslate">Graylist</span> and then **removes it from <span class="notranslate">CSF deny/tempdeny lists</span>**. The latter is done to allow the IP to have access to the Captcha and to store all automatically blocked IP addresses in a single place. Thus, no IP is automatically added to <span class="notranslate">CSF deny/tempdeny lists</span>. In general, when this mode is on: 

* <span class="notranslate">Black List, Gray List</span>, and <span class="notranslate">White List</span> can be managed in Imunify360 regardless of <span class="notranslate">CSF</span>.
* <span class="notranslate">CSF Allow, Deny</span> and <span class="notranslate">Ignore Lists</span> are not automatically imported from <span class="notranslate">CSF</span>. They can still be managed using <span class="notranslate">CSF</span> interface.
* Imunify360 will not block addresses from <span class="notranslate">CSF Allow</span> and <span class="notranslate">Ignore Lists</span>.

**<span class="notranslate">Mod_security</span> recommendations for 3-rd Party Integration mode**

When <span class="notranslate">mod_security</span> is configured with <span class="notranslate">SecRuleEngine On</span> (blocking mode), <span class="notranslate">CSF</span> blocks IP addresses by <span class="notranslate">mod_security</span> events. The number of events to block IP address is defined by <span class="notranslate">` LF_MODSEC`</span> variable in <span class="notranslate">`csf.conf`</span>. This can lead to a large number of false positives.

We recommend to set <span class="notranslate">`LF_MODSEC`</span> variable to 0.

In this case, Imunify360 will block IPs only by <span class="notranslate">mod_security</span> events with high severity.

## CXS Integration

<span class="notranslate">[ConfigServer eXploit Scanner](https://configserver.com/cp/cxs.html) (CXS)</span> has different types of malware scanning, which affects <span class="notranslate">Imunify360 Malware Scanner</span> functionality. Below we describe how to make <span class="notranslate">Imunify360 Malware Scanner</span> work properly. These functionalities can be configured at <span class="notranslate">[Malware Scanner settings](/dashboard/#settings)</span> page, but <span class="notranslate">CXS</span> itself must be configured  as follows:

1. <span class="notranslate">_Automatically scan all modified files_</span>

   <span class="notranslate">CXS Watch</span> daemon must be disabled.

2. <span class="notranslate">_Automatically scan any files uploaded using web_</span>

   <span class="notranslate">CXS ModSecurity</span> vendor should be disabled.

3. <span class="notranslate">_Automatically scan any file uploaded using ftp_</span>

   Imunify360 supports only <span class="notranslate">[Pure-FTPd](https://www.pureftpd.org)</span>. For <span class="notranslate">Pure-FTPd CXS</span> launches pure-uploadscript for the scan. Any pure-uploadscript used by <span class="notranslate">CXS</span> must be disabled. You can use the following commands to do that:
   
  <div class="notranslate">

  ```
  systemctl stop pure-uploadscript.service
  ```
  </div>

  <div class="notranslate">

  ```
  systemctl disable pure-uploadscript.service
  ```
  </div>

  <div class="notranslate">
   
  ```
  systemctl restart imunify360
  ```
  </div>

4. <span class="notranslate">_On-Demand scanning_</span>

   This type of scanning can be always run by Imunify360 and <span class="notranslate">CXS</span> separately. No special actions required.

::: tip Note
Imunify360 doesn’t make any imports from <span class="notranslate">CXS</span>.
:::
