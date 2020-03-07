import * as React from 'react';
import { ContentBox } from '../contentBox/ContentBox';
import { PageHeader } from '../pageHeader/PageHeader';
import { Button } from '../button/Button';

import styles from './FileUploader.scss';
import { Loader } from '../loader/Loader';

export const FileUploader: React.FunctionComponent = () => {
	const [file, setFile] = React.useState(null);
	const [fileType, setFileType] = React.useState(null);
	const [filesArray, setFilesArray] = React.useState(null);
	const [isLoading, setIsLoading] = React.useState(false);
	const [response, setResponse] = React.useState('mmm');

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setIsLoading(true);

		const formData = new FormData();
		formData.append('uploadfile', file, file.name);

		const headers = new Headers();
		headers.delete('Content-Type');

		fetch('http://melapelan.in/upload.php', {
			method: 'post',
			headers,
			body: formData
		})
		.then(res => res.json())
		.then(json => {
			if (json) {
				setResponse(json.moved);
				setFilesArray(Object.values(json.files));
				setIsLoading(false);
			}
			console.log(json)
		})
		.catch(err => {
			setIsLoading(false);
			setResponse(err);
			console.log(err)
		});
	}

	function handleFile(e) {
		setFile(e.target.files[0]);
	}

	function handleSelect(e) {
		console.log(e.target.value);
		setFileType(e.target.value);
	}

	return (
		<ContentBox>
			<PageHeader header="FileUploader">
			</PageHeader>
			<form onSubmit={e => handleSubmit(e)} className={styles.form}>
				<select name="fileType" id="fileType" className={styles.select} onChange={e => handleSelect(e)}>
					<option value="">- Choose file type -</option>
					<option value="image">image</option>
					<option value="document">document</option>
					<option value="pdf">pdf</option>
				</select>
				<input type="file" name="upload-file" id="upload-file" className={styles.fileInput} onChange={e => handleFile(e)}/>
				<Button type="submit" disabled={!file || !fileType} styleOverride={styles.button}>Upload File</Button>
			</form>

			{
				isLoading
				? <Loader />
				:
					filesArray && <div className={styles.response}>
					{response}
					<div>
						<h3>Files on server:</h3>
						{filesArray.map(file => <p key={file}>{file}</p>)}
					</div>
				</div>
			}
		</ContentBox>
	);


}
