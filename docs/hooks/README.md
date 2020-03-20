<div class="notranslate">

# Hooks

</div>

## Overview

Hooks are introduced starting from Imunify360 version 4.2 Beta as a script-based interface for various application events. This is a simple and effective way to automate Imunify360 alerts and event processing.
For example, an administrator can have Imunify360 calling his own script when malicious files are detected or misconfigurations are detected and perform a custom processing or specific actions, for example, create a ticket.
Hooks are available only via CLI.

### Requirements

* You can use any programming language to create a hook script
* A hook script should be executable
* For Native hooks, you should use Python 3.5 only

## How to start using hooks

Start using hooks with three simple steps:

1) Create a script to handle an event (a hook handler):

   * you can use our [scripts example](/hooks/#structure-and-examples-of-a-hook-script) as a template
   * [the following events are available](/hooks/#available-events-and-their-parameters)

2) Register your hook handler in Imunify360 agent - use registration command:

<div class="notranslate">

```
imunify360-agent hook add --event <event name> --path </path/to/hook_script>
```

</div>

3) Once the event added - check results and the [log file](/hooks/#log-file)

## Available events and their parameters

### agent

* subtype ( started | misconfig )
  * started - the event is generated each time the Imunify agent is started/restarted
    * params[]
      * version / string / version of agent

    <div class="notranslate">

    ```
    {"version": "4.6.2-2"}
    ```

    </div>

  * misconfig - the event is generated when the agent detects agent misconfiguration / broken settings / etc.
    * params[]
      * error / string / error message where / what type of misconfiguration was detected and some details

    <div class="notranslate">

    ```
    {
    "error": "ValidationError({'SMTP_BLOCKING': [{'allow_groups': ['must be of list type']}]},)"
    }
    ```

    </div>

### malware-scanning

* subtype ( started | finished )


  * **started** - the event is generated when the malware scanning process is started (for on-demand and background scans only, yet not the ftp / waf / inotify)
    * params[]
      * scan_id / string / identifier of running scan
      * path / string / path that’s scanning
      * type / string / type of scanning (“on-demand”, “background”, “ftp”, “rescan“)
      * scan_params[]  / initial scanning params
        * file_mask / string / file mask to scan
        * follow_symlinks / boolean / shall scanner follow symlinks
        * ignore_mask / string / file mask to ignore
        * intensity / string / intensity type selected (“low”, “moderate”,  “high”)

    <div class="notranslate">

    ```
    {
    "scan_id": "dc3c6061c572410a83be19d153809df1",
    "home": "/home/a/abdhf/",
    "user": "abdhf",
    "type": "background",
    "scan_params": {"file_mask": "*", "follow_symlinks": true, "ignore_mask": "", "intensity": "low"}
    }
    ```

    </div>

  * **finished** - the event is generated when the malware scanning process is finished (for on-demand and background scans only, yet not the ftp / waf / inotify)

    * params[]
      * scan_id / string / identifier of running scan
      * path / string / path that’s scanned
      * users[] / string array/ user that’s scanned
      * started / int / unixtime when scan started
      * total_files / int / total number of files that were scanned
      * total_malicious / int / number of detected malicious files
      * errors[] / string / error message if any occurred during scanning
      * status / string / status of scan (“ok”, “has_errors”, “failed”)
      * scan_params[] / initial scanning params
        * file_mask / string / file mask to scan
        * follow_symlinks / boolean / shall scanner follow symlinks
        * ignore_mask / string / file mask to ignore
        * intensity / string / intensity type selected (“low”, “moderate”,  “high”)

    <div class="notranslate">

    ```
    {
    "scan_id": "dc3c6061c572410a83be19d153809df1",
    "home": "/home/a/abdhf/",
    "user": "abdhf",
    "started": 1587365282,
    "total_files": 873535,
    "total_malicious": 345,
    "errors": [],
    "status": "ok",
    "type": "background",
    "scan_params": {"file_mask": "*", "follow_symlinks": true, "ignore_mask": "", "intensity": "low"}
    }
    ```

    </div>



### malware-detected

* subtype ( critical )
  * **critical**

    * params[]
      * scan_id / string / unique id of the scan
      * errors[] / string / error strings that happened during the last scan
      * started / int / unixtime when the scan was started
      * path / string / path that was scanned
      * users[] / string array / users that have been scanned (if any)
      * total_files / int / number of files checked within the last scanning
      * total_malicious / int / number of detected malicious files
      * tmp_filename / string / path to a temporary file with a list of detected threads. The list of threads is in the format of the following command: <span class="notranslate"> `imunify360-agent malware malicious list --by-scan-id=... --json` </span>

    <div class="notranslate">

    ```
    {
    "scan_id": "dc3c6061c572410a83be19d153809df1",
    "path": "/home/a/abdhf/",
    "username": ["imunify"],
    "started": 1587365282,
    "total_files": 873535,
    "total_malicious": 345,
    "errors": [],
    "files": [
        {
          "username": "imunify",
          "hash": "17c1dd3659578126a32701bb5eaccecc2a6d8307d8e392f5381b7273bfb8a89d",
          "size": "182",
          "cleaned_at": 1553762878.6882641,
          "extra_data": {


          },
          "malicious": true,
          "id": 32,
          "status": "cleanup_removed",
          "file": "/home/imunify/public_html/01102018_2.php",
          "type": "SMW-INJ-04174-bkdr",
          "scan_type": "on-demand",
          "Created": 1553002672
        },
        {
          "username": "imunify",
          "hash": "04425f71ae6c3cd04f8a7f156aee57096dd658ce6321c92619a07e122d33bd32",
          "size": "12523",
          "cleaned_at": 1553762878.6882641,
          "extra_data": {


          },
          "malicious": true,
          "id": 33,
          "status": "cleanup_done",
          "file": "/home/imunify/public_html/22.js",
          "type": "SMW-INJ-04346-js.inj",
          "scan_type": "on-demand",
          "Created": 1553002672
        },
    ...

    }
    ```

    </div>


::: tip Note
All results can be saved in a temporary file before handler invocation and then remove the file after the event is being processed
:::

### malware-cleanup

* subtype ( started | finished )

  * **started** - the event is generated when the malware cleanup process is started (for on-demand and background cleanup only, background auto-cleanup will be implemented later)
    * params[]
      * cleanup_id / string / unique id of the cleanup
      * started / int / unixtime when the cleanup was started
      * tmp_filename / string / path to a temporary file with a scanning report. The list is in the format of the following command: <span class="notranslate"> `imunify360-agent malware malicious list --by-scan-id=... --json` </span>. See malware-detected hook section for details.
      * total_files / int / number of files that were sent for cleanup

    <div class="notranslate">

    ```
    {
    "scan_id": "dc3c6061c572410a83be19d153809df1",
    "started": 1587365282,
    "total_files": 873535,
    "total_cleaned": 872835,
    "tmp_filename": "/var/imunify/tmp/hooks/tmp_02q648234692834698456728439587245.json",
    "errors": [],
    "status": "ok"
    }
    ```

    </div>

  * **finished** - the event is generated when the malware scanning process is finished (for on-demand and background cleanup only, background auto-cleanup will be implemented later)
    * params[]
      * cleanup_id / string / identifier of running cleanup
      * started / int / unixtime when cleanup started
      * total_files / int / number of files that were sent for cleanup
      * total_cleaned / int / number of files that were successfully cleaned
      * tmp_filename / string / path to a temporary file with a list of results.
      * errors[] / string / error messages if any occurred during cleanup
      * errors[] / string / error messages if any occurred during cleanup

    <div class="notranslate">

    ```
    {
    "scan_id": "dc3c6061c572410a83be19d153809df1",
    "started": 1587365282,
    "total_files": 873535,
    "total_cleaned": 872835,
    "tmp_filename": "/var/imunify/tmp/hooks/tmp_02q648234692834698456728439587245.json",
    "errors": [],
    "status": "ok"
    }
    ```

    </div>

## CLI

The following CLI command is used to manage hooks:

<div class="notranslate">

```
imunify360-agent hook [command] --event [event_name|all] [--path </path/to/hook_script>]
```

</div>

The following commands are supported:

* <span class="notranslate"> **add** </span> - register a new event handler
* <span class="notranslate"> **delete** </span> - unregister existing event handler
* <span class="notranslate"> **list** </span> - show existing event handlers
* <span class="notranslate"> **add-native** </span> - register a new native event handler

The third parameter <span class="notranslate"> _event_name_ </span> defines a particular event that invokes a registered handler as opposed to <span class="notranslate"> **all** </span> keyword.
The fourth parameter `/path/to/hook_script` shall contain a valid path to a handler of the event, it shall be any executable or Python Native event handlers that agent will run upon a registered event.

## Native

Native hook is a script written on Python 3.5 and allows to quickly process events. The Python file should contain only one method that customer would implement:

<div class="notranslate">

```
def im_hook(dict_param):
  …
  pass
```

</div>

where `dict_param` would hold the same data as JSON that non-Native hook would get.

## Log File

You can see all hook data in the log file. It is located at <span class="notranslate"> _/var/log/imunify360/hook.log_ </span> .
When the event comes, the data is recorded to the log file in the following format:

<div class="notranslate">

```
timestamp event : id : started [native:] name :  subtype : script_path
```

</div>

* <span class="notranslate"> **native** </span> is prepended for the Native hook implementation
* <span class="notranslate"> **id** </span> is a unique ID for each event

Once the listener is done, the data is recorded to the log file in the following format:

<div class="notranslate">

```
timestamp event : id : done [native:] script_path [OK|ERROR:code]
```

</div>

In case of an error, you can see the error code you have specified.

## Structure and examples of a hook script

Regular (non-native) hook:

<div class="notranslate">

```
#!/bin/bash

data=$(cat)

event=$(jq -r '.event' <<< ${data})
subtype=$(jq -r '.subtype' <<< ${data})

case ${event} in
    malware-scanning)
        case ${subtype} in
            started)
                # do stuff here
            ;;
            *)
                echo "Unhandled subtype: ${subtype}" 1>&2
                exit 1
        esac
        ;;
    *)
        echo "Unhandled event: ${event}/${subtype}" 1>&2
        exit 2
esac
```

</div>

Native hook:

<div class="notranslate">

```
def im_hook(dict_param):
   event = dict_param['event']
   subtype = dict_param['subtype']

   if event == 'malware-scanning':
       if subtype == 'started':
           # do stuff here
           pass
       elif subtype == 'finished':
           # do other stuff here
           pass
       else:
           raise Exception('Unhandled subtype {}'.format(subtype))
   else:
       raise Exception('Unhandled event {}'.format(event))
```

</div>
