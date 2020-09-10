# Backup Providers Integration
[[toc]]
## Overview

<span class="notranslate">**Restore_infected**</span> is a library written in <span class="notranslate">Python 3</span>. It allows to restore files from backups. It supports several backup backends. Each backend is represented as a plugin which uses a particular API to the backup server and provides a user with a common interface to restore individual files regardless of backup backend selected. In addition to the existing backends custom ones can be added.

If one of the files is infected with malware the library can also search for the last uninfected revision of this file in available backups and restore it. By default it uses <span class="notranslate">_imunify360-agent_</span> to detect infected files but a custom algorithm can be used instead.

![](/images/restoreinfectedscheme_zoom70.png)

From the figure above can see that the user of the library is supposed to reference it either using command line interface or calling library functions directly. The CLI supports interaction with the <span class="notranslate">_restore algorithm_</span> but not with the backend API. <span class="notranslate">_Restore algorithm_</span> doesn’t have a functionality to restore a file from any backup but is capable of restoring files infected with malware instead. It treats absent files as infected ones therefore restores the last revision of those.

## Command Line Usage

A command line interface to <span class="notranslate">**restore_infected**</span> library is present in the file <span class="notranslate">**restore_infected_cli.py**</span>. If installed from the RPM, the binary is located in <span class="notranslate">_/usr/bin/restore_infected_</span> and can be used as <span class="notranslate">_“restore_infected”_</span> . To use the CLI a backend and an action should be specified.

The library includes the following backup backend plugins:

* Acronis
* cPanel
* Plesk

### Synopsis

<div class="notranslate">

```
restore_infected BACKEND ACTION
```

</div>

Where <span class="notranslate">`BACKEND`</span> is one of the backends - predefined or custom and <span class="notranslate">`ACTION`</span> is one of the actions described below.

### Actions

#### <span class="notranslate">init</span>

The first step most of the plugins will need is initialization. The most common use of it is to save credentials for the backup server.

<div class="notranslate">

```
init arg0 arg1 ...
```

</div>

The arguments may vary depending on the backend used. To see which arguments are needed for the particular plugin you can call <span class="notranslate">`init`</span> with no arguments:

<div class="notranslate">

``` Python 3
restore_infected acronis init
usage: restore_infected [-h] BACKEND {init,list,restore,cleanup} ...
restore_infected: error: init arguments required: username password
```

</div>

To install Acronis backup agent, pass <span class="notranslate">`--provision`</span> option to <span class="notranslate">`init`</span> command. To force installation when agent is present use <span class="notranslate">`--force`</span> option.

#### <span class="notranslate">list</span>

list shows available backups sorted by date starting with the newest.

<div class="notranslate">

```
list [--until]
```

</div>

If a date string is passed as <span class="notranslate">`--until`</span>, list all backups from now up to that date or all backups otherwise. The date for <span class="notranslate">`--unitil`</span> parameter can be in any format that python-dateutil can parse, e.g. _2017-08-01_, _01 Aug 2017_, etc.

Example:

<div class="notranslate">

``` Python 3
restore_infected acronis list --until "01 Aug 2017"
2017-08-06T10:22:00
2017-08-05T06:00:00
2017-08-03T12:32:00
```

</div>

#### <span class="notranslate">restore</span>

<div class="notranslate">

```
restore files [--until]
```

</div>

Restore files from backup. <span class="notranslate">`restore`</span> takes a list of files (paths to them) which are considered infected, searches for the first uninfected entry of each file in backups and restores it. Backups older than the date set in <span class="notranslate">`--until`</span> are not considered.

Example:

<div class="notranslate">

```
restore_infected acronis restore "/root/file1" "/root/file2" --until "01 Aug 2017"
```

</div>

#### <span class="notranslate">cleanup</span>

The most common use is to delete any temporary files created by the plugin. Depending on the backend the functionality may vary or such function might not be present at all.

Example:

<div class="notranslate">

```
restore_infected plesk cleanup
```

</div>

<span class="notranslate">**extra**</span>

This is for acrivity not connected to restoring from backups.

Currently supported options are
* <span class="notranslate">`login_url`</span> (for Acronis backend). This option returns url to log in to Acronis cloud web interface.
* <span class="notranslate">`refresh_token`</span> (for Acronis backend). This option refreshes authentication token to keep it valid.


## Using as Library

### Restoring Infected Files

The main purpose of the library is to search for uninfected files and to restore them as a replacement for infected ones. The function responsible for that is located in a module <span class="notranslate">`restore_infected.restore`</span>:

<div class="notranslate">

```
restore_infected(backend, files, until=None, scan_func=scan)
```

</div>

Where:

* <span class="notranslate">`backend`</span> is a backend plugin module;
* <span class="notranslate">`files`</span> is a list of files to scan and restore;
* <span class="notranslate">`until`</span> filters the backups before specified date;
* <span class="notranslate">`scan_func`</span> is a function that scans files for malware. It takes a list of files and returns the list of infected ones, by default it uses the function <span class="notranslate">`scan`</span> from the same module.

For example <span class="notranslate">`restore_infected`</span> can be called like this:

<div class="notranslate">

``` Python 3
from restore_infected import backup_backends
from restore_infected.restore import restore_infected
from restore_infected.helpers import DateTime
 
plesk = backup_backends.backend('plesk')
 
def my_scan(files):
  infected = []
  # scan files here
  return infected
 
restore_infected(
plesk,
"/var/www/vhosts/u1.pl7.cloudlinux.com/httpdocs/index.php",
until=DateTime("9 Aug 2017"),
scan_func=my_scan)
```
</div>

### Operating With Backend

A backend plugin can be imported directly from <span class="notranslate">`restore_infected.backup_backends`</span>. Every plugin has a function called <span class="notranslate">`backups`</span> which returns the list of objects each of which is representing a backup, and might have optional functions <span class="notranslate">`init`</span> and/or <span class="notranslate">`cleanup`</span> which initialize and cleanup the plugin respectively.

In the following example let’s print out all backups. For <span class="notranslate">`plesk`</span> in the following example the <span class="notranslate">`init`</span> function is not needed so we can call backups right away:

<div class="notranslate">

``` Python 3
from restore_infected import backup_backends
plesk = backup_backends.backend('plesk')
for backup in plesk.backups():
       print(backup)
```

</div>

This will give us the following list of backups:

<div class="notranslate">

```
/var/lib/psa/dumps/clients/u3/domains/u3.pl7.cloudlinux.com/backup_info_1708080701_1708090501.xml
/var/lib/psa/dumps/clients/u1/domains/u1.pl7.cloudlinux.com/backup_info_1708090500.xml
<...>
/var/lib/psa/dumps/clients/u1/domains/u1.pl7.cloudlinux.com/backup_info_1707070347_1707070353.xml
/var/lib/psa/dumps/clients/u1/domains/u1.pl7.cloudlinux.com/backup_info_1707070347.xml
```

</div>

<span class="notranslate">`backups`</span> has an optional parameter <span class="notranslate">`until`</span> of <span class="notranslate">`restore_infected.helpers.DateTime`</span>. To filter out backups from 9 Aug 2017 till now the code can be changed like this:

<div class="notranslate">

``` Python 3
from restore_infected import backup_backends
plesk = backup_backends.backend('plesk')
from restore_infected.helpers import DateTime
for backup in plesk.backups(DateTime("9 Aug 2017")):
       print(backup)
```

</div>

### Operating With Backup
 
In the previous step we printed out some backups. Every backup entry regardless of the plugin also has a field <span class="notranslate">`created`</span> which tells when the actual backup was created. It makes backups comparable.

Example:

<div class="notranslate">

``` Python 3
backups = plesk.backups()
print(backups[4].created)
print(backups[5].created)
print(backups[4] > backups[5])
Which gives us:
2017-08-08 07:01:00
2017-08-08 07:00:00
True
```

</div>

### Operating With File in Backup

A method <span class="notranslate">`file_data`</span> returns a representation of a file in this backup as an instance of a class (hereafter, this class is referenced to <span class="notranslate">`FileData`</span>):

<div class="notranslate">

```
print(backup.file_data('/var/www/vhosts/u1.pl7.cloudlinux.com/httpdocs/index.php'))
```

</div>

Output:

<div class="notranslate">

``` Python 3
<FileData(
fileobj=<ExFileObject name='/var/lib/psa/dumps/clients/u1/domains/u1.pl7.cloudlinux.com/backup_user-data_1708080700.tgz'>,
filename='/var/www/vhosts/u1.pl7.cloudlinux.com/httpdocs/index.php',
size=418,
mtime=datetime.datetime(2013, 9, 24, 20, 18, 11)
> 
```

</div>

where <span class="notranslate">`mtime`</span> is the time of the last modification of a file.

Besides these fields, FileData also has a method <span class="notranslate">`restore`</span>. If <span class="notranslate">`destination`</span> is passed as a parameter then the file is restored and saved in specified folder saving the directory hierarchy. The default <span class="notranslate">`destination`</span> is `/` which means that the file is restored to the place of its origin.

Example:

<div class="notranslate">

``` Python 3
from restore_infected import backup_backends
plesk = backup_backends.backend('plesk')
backups = plesk.backups()
filedata = \
backups[5].file_data('/var/www/vhosts/u1.pl7.cloudlinux.com/httpdocs/index.php')
filedata.restore('/home/user/restored_files')
```

</div>

It gives no output if zero errors occurred and creates <span class="notranslate">`'var/...'`</span> directories in <span class="notranslate">`'/home/user/restored_files'`</span> with a restored file.

From now on Acronis backend supports <span class="notranslate">`provision=True/False`</span> (by default <span class="notranslate">`False`</span>) and <span class="notranslate">`force=True/False`</span> (by default <span class="notranslate">`False`</span>) options for <span class="notranslate">`init`</span> action, to install Acronis backend agent. Use <span class="notranslate">`force`</span> to reinstall agent if it is already present.

As of version 1.2-1, Acronis <span class="notranslate">`init`</span> takes optional argument <span class="notranslate">`tmp_dir`</span> to specify temporal directory for installing Acronis backup client.

Example:

<div class="notranslate">

``` Python 3
from restore_infected import backup_backends
acronis = backup_backends.backend('acronis')
acronis.init(name, password, provision=True, force=True, tmp_dir=None)
```

</div>

* <span class="notranslate">`login_url`</span> action for return URL to log in to Acronis web interface.

   Example:

   <div class="notranslate">

   ``` Python 3
   from restore_infected import backup_backends
    acronis = backup_backends.backend('acronis')
    token = acronis.login_url()
    ```

    </div>

* <span class="notranslate">`login_url`</span> action for refreshing authentication token.

   Example:

   <div class="notranslate">

   ``` Python 3
    from restore_infected import backup_backends
     acronis = backup_backends.backend('acronis')
    acronis.refresh_token()
   ```

   </div>

* <span class="notranslate">`info`</span> action to return region, schedule and used storage space in JSON format.

   Example:

   <div class="notranslate">

   ``` Python 3
    from restore_infected import backup_backends
    acronis = backup_backends.backend('acronis')
    info = acronis.info()
    {'schedule': {...}, 'usage': 17890969600, 'region': 'eu2'}
   ```

   </div>

* <span class="notranslate">`make_initial_backup`</span> makes initial backup after Acronis backup client is installed. By default it does not wait for the backup completion. To wait for the backup to be completed use option <span class="notranslate">`trace=True`</span> . When such an option is on, current completion percentage is being outputted to log file (by default <span class="notranslate">_/var/restore_infected/acronis_backup.log_</span>. Returns <span class="notranslate">`True`</span> if backup is successful and <span class="notranslate">`False`</span> otherwise.

   Example:

   <div class="notranslate">

   ``` Python 3
    from restore_infected import backup_backends
    acronis = backup_backends.backend('acronis')
    acronis.make_initial_backup(trace=False)
   ```

   </div>

## Creating Custom Backup Backend Plugin

### Creating Module
 
To create a plugin for a particular backup backend a python module should be created in <span class="notranslate">`backup_backends`</span> folder. The plugin will be registered automatically when a function <span class="notranslate">`backend(name)`</span> from <span class="notranslate">`backup_backends`</span> module is called.
If the plugin should be used only in some appropriate systems environment <span class="notranslate">`is_suitable`</span> function could be implemented, which should return Boolean. It will be called during <span class="notranslate">`backend(name)`</span> from <span class="notranslate">`backup_backends`</span> function call and if <span class="notranslate">`is_suitable False`</span>, then <span class="notranslate">`BackendNonApplicableError`</span> exception will be raised.

Here is an example of <span class="notranslate">`is_suitable`</span> function for DirectAdmin module:

<div class="notranslate">

``` Python 3
def is_suitable():
return os.path.isfile('/usr/local/directadmin/directadmin')
```

</div>

### Defining Classes

There are two mandatory classes that have to be implemented in the plugin.

#### <span class="notranslate">Backup</span> Class

This class represents a backup. It can have any name since it is not directly referenced to from the outside of the module. It can either be inherited from

<div class="notranslate">

```
backup_backends_lib.BackupBase
```

</div>

which already have some features (e.g. comparison) implemented or it can be written from scratch. The class must define a method <span class="notranslate">`file_data`</span> that returns a <span class="notranslate">FileData</span> object (described below). Objects of this class should also be comparable by the date created as if they were actual backups.

#### <span class="notranslate">FileData</span> Class

The second class that has to be implemented is <span class="notranslate">`FileData`</span> which represents a file in a backup. It must have file size, modify time and a method <span class="notranslate">`restore`</span>.

### Implementing API Functions

There are 3 functions in the plugin, but only one of them is mandatory - <span class="notranslate">`backups`</span>. This function returns a list of Backup instances. Optional functions are <span class="notranslate">`init`</span>, <span class="notranslate">`cleanup`</span>, and <span class="notranslate">`info`</span> that are responsible for the initialization, cleanup and getting some information of the plugin respectively.

<div class="notranslate">

``` Python 3
def init(*args):
...
def backups(until=None):
...
def cleanup():
   …
def info():
   ... 
```

</div>

Depending on the features of the backend being integrated, the plugin might have one or more classes and functions responsible to authorise on the backup server and retrieve data from it, however only functions <span class="notranslate">`init`</span>, <span class="notranslate">`backups`</span>, <span class="notranslate">`cleanup`</span>, and <span class="notranslate">`info`</span> are called from the outside of the module.

To check that the plugin works as intended try passing your plugin name to the CLI for example like this:

<div class="notranslate">

``` Python 3
restore_infected <your_backend_name> list
```

</div>

To be used in asynchronous libraries <span class="notranslate">`async_restore_infected`</span> routine has been added. Typical use case:

<div class="notranslate">

``` Python 3
import logging
from restore_infected import backup_backends
from restore_infected.restore import async_restore_infected
from defence360agent.malscan.scanner import MalwareScanner
 
async def _custom_scan_function(files):
    if not files:
        return []
    still_infected = []
    scanner = MalwareScanner().scan_filelist()
    scanner.start(files)
    result = await scanner.async_wait()
    if result['results']:
        still_infected = list(result['results'].keys())
    return still_infected
 
class DummyDumper:
    @classmethod
    async def do_restore(cls, files):
        backend = backup_backends.backend('cpanel')
        return await async_restore_infected(
            backend, files, scan_func=_custom_scan_function
```

</div>

For Acronis backup two restore modes are available:
* **<span class="notranslate">Download</span> mode** – a file to be restored is simply pulled by HTTP from backup server
* **<span class="notranslate">Recovery</span> mode**  – <span class="notranslate">`restore_infected`</span> just sends command to backup server and then waits for the file to be restored is actually placed to expected folder. Its size is equal to expected one.
  
Recovery mode is used by default because it restores file owner and permissions, too. Though downloading mode can be enabled with passing <span class="notranslate">`use_download`</span> option to <span class="notranslate">`restore_infected`</span> function. The second optional parameter - <span class="notranslate">`timeout`</span> can be passed to <span class="notranslate">`restore_infected`</span> function to change the default waiting time (time to wait while a file to be restored is being pulled by recovery agent). By default timeout is 600 seconds.

