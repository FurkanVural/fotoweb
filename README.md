# fotoweb
In this project, I kept the photos uploaded on a site in nosql db.
I kept the information such as title, owner, date and size of these photos in mysql db.
I deduplicated these photos to take up less space in nosql db.
Thanks to this database separation and deduplication, I solved the problem of system slowdown and unnecessary space taking up.

I stored the photos with Base64 code. Base64 is an encoding method that represents data based on text and is particularly useful in the following scenarios:
Database Storage: Base64 encoded data is a text-based format, so it can be stored in a way that is compatible with many types of databases (for example, SQL-based or NoSQL). This offers the ability to store files on a separate server or in the database independent of the file system.
Web Pages and APIs: Base64 encoded images can be used to convey data as text in web pages or API requests. This can reduce the size of HTTP requests and responses and make data transfer easier.
Mobile Applications: Mobile applications can transport data via Base64 code when storing photos in local databases or communicating with servers.
Data Transfer and Storage: Text-based data formats simplify data transfer and storage between different systems or platforms. Moving data on a text basis can reduce compatibility issues.
