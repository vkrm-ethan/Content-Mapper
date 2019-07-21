from django.shortcuts import render

# Create your views here.
from django.http import HttpResponse
import os
import re
import chardet
import json

def index(request):
	keyDetails=[]
	with open('config.json') as f:
		data = json.load(f)
		#print(data)
		fileTypes = data['fileTypes']
		marketList=data['marketList']
		excludeProperties=data['excludeProperties']
		teamsiteBasePath=data['teamsiteBasePath']
		propTypes=data['propTypes']
		suiteList=data['suiteList']
		foldStruct = data['foldStruct']
	if 'transText' in request.GET:
		searchText=request.GET['transText']
		basePath = data['deciderPath']+request.GET['marketName']+'\\Feb8\\mounts\\webe_cont\\qaf\\romania2'
		propertiesLocation='\\properties\\'+request.GET['propTypes']
		for suite in suiteList:
			#print(suite)
			searchPath= basePath + "\\"+suite +propertiesLocation
			#print(searchPath)
			for outFolder in foldStruct:
				outSearchPath=searchPath
				if(request.GET['propTypes']!='NTS'):
					outSearchPath=outSearchPath+'\\'+outFolder
				#print(outSearchPath)
				for inFolder in foldStruct[outFolder]:
					
					inSearchPath=outSearchPath+'\\'+inFolder
					#print(inSearchPath)
					for subdir, dirs, files in os.walk(inSearchPath):
						#print(subdir)
						#print(files)
						for file in files:
							#print(file)
							fileReg = re.compile(excludeProperties)
							if(not fileReg.search(file)):
								charEn=chardet.detect(open(subdir+'\\'+file, "rb").read())
								#print(charEn['encoding'])
								f=open(subdir+'\\'+file , encoding=charEn['encoding'])
								reg = re.compile('.*'+searchText+'.*' , re.IGNORECASE)
								#print(searchText)
								searchEn=str(searchText.encode('utf-8', 'strict').decode(encoding = 'UTF-8',errors = 'strict'))
								#print(searchEn)
								searchEn=searchEn.replace('\\u','')
								#print(searchEn)
								#print(file)
								for line in f:
									
									lineEn=str(line.encode('utf-8', 'strict').decode(encoding = 'UTF-8',errors = 'strict'))
									lineEn=lineEn.replace('\\u','')
									lineEnArr=lineEn.split('=')
									if len(lineEnArr)>1:
										lineEnVal=lineEnArr[0]
										if(request.GET['propTypes']!='NTS'):
											lineEnVal=lineEnArr[1]
										if searchEn.lower() in lineEnVal.lower():
											#print(file)
											teamsiteFilePath=''
											for typ in fileTypes:
												#print(typ)
												if(re.compile(typ).search(file)):
													teamsiteFilePath = teamsiteBasePath+request.GET['marketName']+fileTypes[typ];
											keyset={}
											fileName= re.sub(r'properties', 'html', file)
											keyset['FileName']=fileName
											keyset['KeyName']=line
											keyset['PathName']=inSearchPath
											keyset['TeamSitePathName']=teamsiteFilePath
											keyDetails.append(keyset)
			#print(keyDetails)

		
	return render(request,'home.html',{'keyDetails': keyDetails,'marketList':marketList,'propTypes':propTypes})
	